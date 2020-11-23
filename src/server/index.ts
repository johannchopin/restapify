import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as express from 'express'
import * as http from 'http'

import { replaceAll } from '../utils'
import { routeResolve } from './utils'
import { getRoute, Route as RouteData } from './getRoute'
import { HttpVerb } from './types'
import { getInitialisedInternalApi } from '../internalApi'

const NUMBER_CAST_INDICATOR = '(number)'
const DEFAULT_PORT = 6767
const WEBSITE_FOLDER_PATH = path.resolve(__dirname, '../website/public')

const getDirs = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
}
const getFiles = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())
}

// I N T E R F A C E S
export interface RouteState {
  route: string
  state?: string
  method?: HttpVerb
}
interface PrivateRouteState extends Omit<RouteState, 'state'> {
  state: string
}
export interface RestApiFyParams {
  rootDir: string
  port?: number
  apiPrefix?: string
  states?: RouteState[]
}
export type Routes = {
  [url: string]: {
    [method in HttpVerb]: RouteData
  }
}

class RestApiFy {
  protected app: express.Express
  protected server: any
  public routes: Routes = {}
  public entryFolderPath: string
  public port: number
  public entryFolderFullPath: string
  public apiPrefix: string
  public states: PrivateRouteState[] = []

  constructor({
    rootDir,
    port = DEFAULT_PORT,
    apiPrefix = '/api',
    states = []
  }: RestApiFyParams) {
    this.entryFolderPath = rootDir
    this.entryFolderFullPath = path.resolve(__dirname, rootDir)
    this.port = port
    this.apiPrefix = apiPrefix
    this.states = states.filter(state => {
      return state.state !== undefined
    }) as PrivateRouteState[]

    this.init()
  }

  private init = (): void => {
    this.check()
    this.configServer()
    this.configWebsite()
    this.configInternalApi()
    this.run()
  }

  private configServer = (): void => {
    this.app = express()
    this.server = http.createServer(this.app)
    this.handleHttpServerErrors()
    this.configFolder(this.entryFolderPath)
  }

  private configWebsite = (): void => {
    this.app.use('/restapify', express.static(WEBSITE_FOLDER_PATH))
  }

  private configInternalApi = (): void => {
    this.app = getInitialisedInternalApi(this.app, {
      routes: this.routes,
      onClose: this.close
    })
  }

  private check = (): void => {
    this.checkEntryFolder()
  }

  private handleHttpServerErrors = (): void => {
    this.server.on('error', (e: any) => {
      switch (e.code) {
      case 'EADDRINUSE':
        console.log(`Port ${this.port} not available`)
        this.port += 1
        this.restartServer()
        break

      default:
        console.log(`Unknow error ${e.code}`)
        break
      }
    })
  }

  private restartServer = (): void => {
    this.close()
    this.init()
  }

  private checkEntryFolder = (): void => {
    const folderExists = fs.existsSync(this.entryFolderFullPath)
    if (!folderExists) {
      this.logError(`Folder ${this.entryFolderPath}`)
    }
  }

  private configFolder = (folderPath: string): void => {
    const dirs = getDirs(folderPath)
    const files = getFiles(folderPath)

    files.forEach(filename => {
      this.configFile(path.resolve(folderPath, filename))
    })

    dirs.forEach(dir => {
      this.configFolder(path.resolve(folderPath, dir))
    })
  }

  private getNumbersToCast = (str: string): string[] => {
    const re = /"\(number\)\[([^,}]+)\]"/gi
    const match = str.match(re)

    return match !== null ? match : []
  }

  private configRoute = (routeData: RouteData): void => {
    let fileContent = routeData.fileContent
    let {
      normalizedRoute,
      routeVars,
      statusCode,
      header
    } = routeData
    const numberParamsToCast = this.getNumbersToCast(fileContent)
    normalizedRoute = routeResolve(this.apiPrefix, normalizedRoute)

    numberParamsToCast.forEach(numberParamToCast => {
      fileContent = replaceAll(
        fileContent,
        numberParamToCast,
        numberParamToCast.slice(`"${NUMBER_CAST_INDICATOR}`.length, -1)
      )
    })

    const responseCallback = (req: any, res: any): void => {
      res.status(statusCode)

      if (header) {
        res.header(header)
      }

      let vars: {[key: string]: string} = {}
      routeVars.forEach(variable => {
        vars[variable] = req.params[variable]
      })

      res.send(JSON.parse(routeData.getBody(vars)))
    }

    this.addRoute(routeData)
    this.logRouteListening(routeData)
    this.listenRoute(routeData.httpVerb, normalizedRoute, responseCallback)
  }

  private addRoute = (routeData: RouteData): void => {
    const { route, httpVerb } = routeData
    if (this.routes[route] === undefined) {
      // @ts-ignore
      this.routes[route] = {}
    }

    this.routes[route][httpVerb] = routeData
  }

  private logRouteListening = (routeData: RouteData): void => {
    const { route, stateVars, httpVerb } = routeData
    const stateVarsString = stateVars.length > 0 ? '{' + stateVars.join('|') + '}' : ''
    console.log(`> ${httpVerb} ${route} ${stateVarsString}`)
  }

  private configFile = (filePath: string): void => {
    const routeData = getRoute(filePath, this.entryFolderFullPath)

    const matchingState = this.states.find(state => {
      return state.route === routeData.route
        && (state.method === routeData.httpVerb
          || (state.method === undefined && routeData.httpVerb === 'GET'))
    })

    if ((matchingState === undefined && routeData.stateVars.length <= 0)
      || (matchingState && routeData.stateVars.includes(matchingState.state))) {
      this.configRoute(routeData)
    }
  }

  private listenRoute = (
    method: HttpVerb,
    route: string,
    callback: (req: any, res: any) => void
  ): void => {
    switch (method) {
    case 'POST':
      this.app.post(route, callback)
      break

    case 'DELETE':
      this.app.delete(route, callback)
      break

    case 'PUT':
      this.app.put(route, callback)
      break

    case 'PATCH':
      this.app.patch(route, callback)
      break

    case 'GET': default:
      this.app.get(route, callback)
      break
    }
  }

  private logError = (error: string): void => {
    console.error(`ERROR: ${error}`)
    this.kill()
  }

  public run = (): void => {
    console.log(`Server started on port ${this.port}`)
    this.server.listen(this.port)
  }

  private removeState = (route: string, method?: HttpVerb): void => {
    this.states = this.states.filter(state => {
      return state.route !== route && state.method !== method
    })
  }

  public setState = (newState: RouteState): void => {
    if (newState.state) {
      const actualStateIndex = this.states.findIndex(state => {
        return state.route === newState.route && state.method === newState.method
      })
      const stateExist = actualStateIndex !== -1

      if (stateExist) {
        this.states[actualStateIndex] = newState as PrivateRouteState
      } else {
        this.states.push(newState as PrivateRouteState)
      }
    } else {
      this.removeState(newState.route, newState.method)
    }

    this.restartServer()
  }

  public close = (): void => {
    console.log('Server stopped')
    this.server.close()
  }

  public kill = (): void => {
    process.exit(0)
  }
}

export default RestApiFy
