import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as express from 'express'
import * as http from 'http'
import * as open from 'open'
import * as chokidar from 'chokidar'

import { HttpVerb } from './types'

import {
  getDirs,
  getFiles,
  getRoutesByFileOrder as getRoutesByFileOrderHelper,
  routeResolve,
  withoutUndefinedFromObject
} from './utils'
import { getRoute, Route as RouteData } from './getRoute'
import { getInitialisedInternalApi } from './internalApi'

const DEFAULT_PORT = 6767
const DASHBOARD_FOLDER_PATH = path.resolve(__dirname,
  '../node_modules/restapify-dashboard/public/')

// I N T E R F A C E S
export interface RouteState {
  route: string
  state?: string
  method?: HttpVerb
}
export interface PrivateRouteState extends Omit<RouteState, 'state'> {
  state: string
}
export interface RestapifyParams {
  rootDir: string
  port?: number
  baseURL?: string
  states?: RouteState[]
  openDashboard?: boolean
  hotWatch?: boolean
}
export type Routes = {
  [method in HttpVerb]: {[url: string]: RouteData}
}

class Restapify {
  protected app: express.Express
  protected server: any
  public routes: Routes = {
    GET: {}, POST: {}, DELETE: {}, PUT: {}, PATCH: {}
  }
  public entryFolderPath: string
  public port: number
  public apiBaseUrl: string
  public states: PrivateRouteState[] = []
  public hotWatch: boolean

  constructor({
    rootDir,
    port = DEFAULT_PORT,
    baseURL = '/api',
    states = [],
    openDashboard = false,
    hotWatch = true
  }: RestapifyParams) {
    this.entryFolderPath = rootDir
    this.port = port
    this.apiBaseUrl = baseURL
    this.hotWatch = hotWatch
    this.states = states.filter(state => {
      return state.state !== undefined
    }) as PrivateRouteState[]

    this.init()

    if (openDashboard) this.openDashboard()
  }

  private init = (): void => {
    this.check()
    this.configServer()
    this.configDashboard()
    this.configInternalApi()
    this.configHotWatch()
    this.run()
  }

  private configHotWatch = (): void => {
    if (this.hotWatch) {
      chokidar.watch(this.entryFolderPath, {
        ignoreInitial: true
      }).on('all', () => {
        this.restartServer()
      })
    }
  }

  private configServer = (): void => {
    this.app = express()
    this.server = http.createServer(this.app)

    // Add middleware to parse request's body
    this.app.use(express.json())

    // Handle CORS
    this.app.use((req: any, res: any, next) => {
      res.append('Access-Control-Allow-Origin', ['*'])
      res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
      res.append('Access-Control-Allow-Headers', 'Content-Type')
      next()
    })

    this.handleHttpServerErrors()
    this.configFolder(this.entryFolderPath)
    this.serveRoutes()
  }

  private configDashboard = (): void => {
    this.app.use('/restapify', express.static(DASHBOARD_FOLDER_PATH))
  }

  private configInternalApi = (): void => {
    const { routes, states } = this
    this.app = getInitialisedInternalApi(this.app, {
      routes,
      states,
      setState: this.setState,
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
    const folderExists = fs.existsSync(this.entryFolderPath)
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

  private getRouteData = (
    method: HttpVerb,
    route: string
  ): RouteData | null => {
    if (!this.routes[method][route]) {
      return null
    }

    const routeData = this.routes[method][route]
    const matchingState = this.states.find(state => {
      return state.route === route
            && (state.method === method
              || (state.method === undefined && method === 'GET'))
    })

    if (matchingState && routeData.states) {
      const { state } = matchingState

      return { ...routeData, ...routeData.states[state] }
    }

    return routeData
  }

  private serveRoutes = (): void => {
    (Object.keys(this.routes) as HttpVerb[]).forEach(method => {
      Object.keys(this.routes[method]).forEach(route => {
        const routeData = this.getRouteData(method, route)

        if (routeData) {
          this.serveRoute(routeData)
        }
      })
    })
  }

  private serveRoute = (routeData: RouteData): void => {
    let {
      normalizedRoute,
      routeVars,
      statusCode,
      header
    } = routeData

    normalizedRoute = routeResolve(this.apiBaseUrl, normalizedRoute)

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

    this.listenRoute(routeData.method, normalizedRoute, responseCallback)
  }

  private configFile = (filePath: string): void => {
    const routeData = getRoute(filePath, this.entryFolderPath)
    const {
      route,
      method,
      stateVars,
      body,
      getBody,
      header,
      isExtended,
      statusCode,
      fileContent
    } = routeData
    const routeExist = this.routes[method][route] !== undefined
    const routeContainsStates = stateVars.length > 0

    if (!routeExist) {
      this.routes[method][route] = {} as RouteData
    }

    if (routeContainsStates) {
      if (this.routes[method][route] === undefined) {
        this.routes[method][route] = {} as RouteData
      }

      if (this.routes[method][route].states === undefined) {
        this.routes[method][route].states = {}
      }

      stateVars.forEach(stateVar => {
        // @ts-ignore
        this.routes[method][route].states[stateVar] = withoutUndefinedFromObject({
          body,
          fileContent,
          header,
          isExtended,
          statusCode,
          getBody
        })
      })
    } else {
      this.routes[method][route] = { ...this.routes[method][route], ...routeData }
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

  public getServedRoutes = ():{
    route: string,
    method: HttpVerb
  }[] => {
    return getRoutesByFileOrderHelper(this.routes)
  }

  public openDashboard = (): void => {
    open(`http://localhost:${this.port}/restapify`)
  }

  public close = (): void => {
    this.server.close()
  }

  public kill = (): void => {
    process.exit(0)
  }
}

export default Restapify
