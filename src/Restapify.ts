import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as express from 'express'
import * as http from 'http'
import * as open from 'open'
import * as chokidar from 'chokidar'

import {
  HttpVerb,
  RestapifyErrorCallbackParam,
  RestapifyErrorName,
  RestapifyEventCallback,
  RestapifyEventCallbackParam,
  RestapifyEventName
} from './types'
import { INTERNAL_BASEURL } from './CONST'

import {
  getRouteFiles,
  getRoutesByFileOrder as getRoutesByFileOrderHelper,
  isJsonString,
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
  baseUrl?: string
  states?: RouteState[]
  openDashboard?: boolean
  hotWatch?: boolean
}
export type Routes = {
  [method in HttpVerb]: {[url: string]: RouteData}
}
type EventCallbackStore = {
  [event in RestapifyEventName]?: RestapifyEventCallback[]
}
type ListedFiles = {
  [filename: string]: string
}

class Restapify {
  private eventCallbacksStore: EventCallbackStore = {}
  private app: express.Express
  private server: any
  private listedRouteFiles: ListedFiles = {}
  public routes: Routes = {
    GET: {}, POST: {}, DELETE: {}, PUT: {}, PATCH: {}
  }
  public rootDir: string
  public port: number
  public apiBaseUrl: string
  public states: PrivateRouteState[] = []
  public hotWatch: boolean
  public autoOpenDashboard: boolean

  constructor({
    rootDir,
    port = DEFAULT_PORT,
    baseUrl = '/api',
    states = [],
    openDashboard = false,
    hotWatch = true
  }: RestapifyParams) {
    this.rootDir = rootDir
    this.port = port
    this.apiBaseUrl = baseUrl
    this.hotWatch = hotWatch
    this.autoOpenDashboard = openDashboard
    this.states = states.filter(state => {
      return state.state !== undefined
    }) as PrivateRouteState[]
  }

  private listRouteFiles = (): void => {
    this.listedRouteFiles = getRouteFiles(this.rootDir)
  }

  private configHotWatch = (): void => {
    if (this.hotWatch) {
      chokidar.watch(this.rootDir, {
        ignoreInitial: true
      }).on('all', () => {
        this.restartServer(true)
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
    this.configRoutesFromListedFiles()
    this.serveRoutes()
  }

  private configDashboard = (): void => {
    this.app.use(INTERNAL_BASEURL, express.static(DASHBOARD_FOLDER_PATH))
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

  private handleHttpServerErrors = (): void => {
    this.server.on('error', (e: any) => {
      switch (e.code) {
      case 'EADDRINUSE': {
        const error: RestapifyErrorName = 'MISS:PORT'
        this.executeCallbacksForSingleEvent('error', { error })
        break
      }
      default:
        console.log(`Unknow error ${e.code}`)
        break
      }
    })
  }

  private restartServer = (hardRestart = false): void => {
    this.close()
    this.run(!hardRestart)
  }

  private checkApiBaseUrl = (): void => {
    if (this.apiBaseUrl.startsWith(INTERNAL_BASEURL)) {
      const error: RestapifyErrorName = 'INV:API_BASEURL'
      throw new Error(error)
    }
  }

  private checkRootDirectory = (): void => {
    const folderExists = fs.existsSync(this.rootDir)
    if (!folderExists) {
      const error: RestapifyErrorName = 'MISS:ROOT_DIR'
      throw new Error(error)
    }
  }

  private checkJsonFiles = (): void => {
    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeFileContent = this.listedRouteFiles[routeFilePath]
      const isJsonValid = isJsonString(routeFileContent)

      if (!isJsonValid) {
        const error: RestapifyErrorName = 'INV:JSON_FILE'
        throw new Error(`${error} ${routeFilePath}`)
      }
    })
  }

  private configRoutesFromListedFiles = (): void => {
    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeData = getRoute(
        routeFilePath,
        this.rootDir,
        this.listedRouteFiles[routeFilePath]
      )
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

  private startServer = (): void => {
    this.server.listen(this.port)
  }

  public run = (restartedBecauseOfHotWatch = false):void => {
    try {
      if (!restartedBecauseOfHotWatch) {
        this.configEventsCallbacks()
        this.checkApiBaseUrl()
        this.checkRootDirectory()
      }

      this.listRouteFiles()
      this.checkJsonFiles()
      this.configServer()

      if (!restartedBecauseOfHotWatch) this.configDashboard()

      this.configInternalApi()

      if (!restartedBecauseOfHotWatch) this.configHotWatch()
      if (!restartedBecauseOfHotWatch && this.autoOpenDashboard) this.openDashboard()
      if (!restartedBecauseOfHotWatch) this.executeCallbacks('server:start')

      this.startServer()

      if (!restartedBecauseOfHotWatch) this.executeCallbacks('start')
      else this.executeCallbacks('server:restart')
    } catch (error) {
      this.executeCallbacks('error', { error: error.message })
    }
  }

  private configEventsCallbacks = ():void => {
    this.onError(({ error }) => {
      if (error === 'MISS:PORT') {
        this.port += 1
        this.restartServer(true)
      }
    })
  }

  private removeState = (route: string, method?: HttpVerb): void => {
    this.states = this.states.filter(state => {
      return state.route !== route && state.method !== method
    })
  }

  private createSingleEventStoreIfMissing = (eventName: RestapifyEventName): void => {
    if (this.eventCallbacksStore[eventName] === undefined) {
      this.eventCallbacksStore[eventName] = []
    }
  }

  private addSingleEventCallbackToStore = (
    event: RestapifyEventName,
    callback: RestapifyEventCallback
  ): void => {
    this.createSingleEventStoreIfMissing(event)

    // @ts-ignore
    this.eventCallbacksStore[event].push(callback)
  }

  private addEventCallbackToStore = (
    event: RestapifyEventName | RestapifyEventName[],
    callback: RestapifyEventCallback
  ):void => {
    if (Array.isArray(event)) {
      event.forEach(eventName => {
        this.addSingleEventCallbackToStore(eventName, callback)
      })
    } else {
      this.addSingleEventCallbackToStore(event, callback)
    }
  }

  private executeCallbacksForSingleEvent = (
    event: RestapifyEventName,
    params?: RestapifyEventCallbackParam
  ):void => {
    const callbacks = this.eventCallbacksStore[event]
    if (callbacks) {
      callbacks.forEach(callback => {
        if (params) {
          callback(params)
        } else {
          callback()
        }
      })
    }
  }

  private executeCallbacks = (
    event: RestapifyEventName | RestapifyEventName[],
    params?: RestapifyEventCallbackParam
  ): void => {
    if (Array.isArray(event)) {
      event.forEach(eventName => {
        this.executeCallbacksForSingleEvent(eventName, params)
      })
    } else {
      this.executeCallbacksForSingleEvent(event, params)
    }
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
    // open with delay so user has time to see the console output
    setTimeout(() => {
      open(`http://localhost:${this.port}/restapify`)
    }, 1000)
  }

  public close = (): void => {
    this.server.close()
  }

  public on = (
    event: RestapifyEventName | RestapifyEventName[],
    callback: RestapifyEventCallback
  ): void => {
    this.addEventCallbackToStore(event, callback)
  }

  public onError = (callback: (params: RestapifyErrorCallbackParam) => void): void => {
    this.addSingleEventCallbackToStore('error', callback)
  }

  public kill = (): void => {
    process.exit(0)
  }
}

export default Restapify
