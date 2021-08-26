import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import express, { Application } from 'express'
import cors from 'cors'
import * as http from 'http'
import open from 'open'
import * as chokidar from 'chokidar'
import nocache from 'nocache'

import {
  HttpVerb,
  RestapifyErrorCallbackParam,
  RestapifyErrorName,
  RestapifyEventCallback,
  RestapifyEventCallbackParam,
  RestapifyEventName
} from './types'
import {
  INTERNAL_BASEURL,
  DASHBOARD_FOLDER_PATH,
  OPEN_DASHBOARD_TIMEOUT
} from './const'

import {
  getRouteFiles,
  getRoutesByFileOrder as getRoutesByFileOrderHelper,
  getSortedRoutesSlug,
  isJsonString,
  routeResolve,
  withoutUndefinedFromObject
} from './utils'
import { getRoute, Route as RouteData } from './getRoute'
import { getInitialisedInternalApi } from './internalApi'
import { areFakerVarsSyntaxValidInContent } from './fakerHelpers'

const DEFAULT_PORT = 6767

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
interface RunOptions {
  hard?:boolean
  startServer?:boolean
  openDashboard?: boolean
  hotWatch?: boolean
}
type EventCallbackStore = {
  [event in RestapifyEventName]?: RestapifyEventCallback[]
}
type ListedFiles = {
  [filename: string]: string
}

class Restapify {
  private eventCallbacksStore: EventCallbackStore = {}
  private app: Application
  private server: any
  private chokidarWatcher: chokidar.FSWatcher
  private listedRouteFiles: ListedFiles = {}
  public routes: Routes
  public rootDir: string
  public port: number
  public publicPath: string
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
    this.publicPath = baseUrl
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
      this.chokidarWatcher = chokidar.watch(this.rootDir, {
        ignoreInitial: true
      })

      const events = ['change', 'unlink']

      events.forEach(event => {
        this.chokidarWatcher.on(event, () => {
          this.restartServer({ hard: true })
        })
      })
    }
  }

  private configServer = (): void => {
    this.app = express()
    this.server = http.createServer(this.app)

    // Add middleware to parse request's body
    this.app.use(express.json())
    this.app.use(nocache())
    this.app.set('etag', false)

    // Handle CORS
    this.app.use(cors())
    this.app.use((req: any, res: any, next) => {
      res.set('Cache-Control', 'no-store')
      next()
    })

    this.handleHttpServerErrors()
    this.configRoutesFromListedFiles()
    this.serveRoutes()
  }

  private configDashboard = (): void => {
    const dashboardFolderPath = path.resolve(__dirname, DASHBOARD_FOLDER_PATH)
    this.app.use(INTERNAL_BASEURL, express.static(dashboardFolderPath))
  }

  private configInternalApi = (): void => {
    const {
      routes,
      states,
      port,
      publicPath: baseUrl
    } = this
    this.app = getInitialisedInternalApi(this.app, {
      port,
      baseUrl,
      routes,
      states,
      setState: this.setState
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

  private restartServer = (options?: RunOptions): void => {
    this.executeCallbacks('server:restart')
    this.closeServer()
    this.customRun({ ...options, hard: false, openDashboard: false })
  }

  private checkpublicPath = (): void => {
    if (this.publicPath.startsWith(INTERNAL_BASEURL)) {
      const error: RestapifyErrorName = 'INV:API_BASEURL'
      const errorObject = { error }
      throw new Error(JSON.stringify(errorObject))
    }
  }

  private checkRootDirectory = (): void => {
    const folderExists = fs.existsSync(this.rootDir)
    if (!folderExists) {
      const error: RestapifyErrorName = 'MISS:ROOT_DIR'
      const errorObject = { error }
      throw new Error(JSON.stringify(errorObject))
    }
  }

  private checkJsonFiles = (): void => {
    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeFileContent = this.listedRouteFiles[routeFilePath]
      const isJsonValidResponse = isJsonString(routeFileContent)
      // eslint-disable-next-line max-len
      const isJsonContainingValidFakerSyntaxResponse = areFakerVarsSyntaxValidInContent(routeFileContent)

      if (isJsonValidResponse !== true) {
        const error: RestapifyErrorName = 'INV:JSON_FILE'
        const errorObject = {
          error,
          message: `Invalid json file ${routeFilePath}: ${isJsonValidResponse}`
        }
        throw new Error(JSON.stringify(errorObject))
      } else if (isJsonContainingValidFakerSyntaxResponse !== true) {
        const { namespace, method } = isJsonContainingValidFakerSyntaxResponse
        const error: RestapifyErrorName = 'INV:FAKER_SYNTAX'
        const errorObject = {
          error,
          message: `The fakerjs method call \`faker.${namespace}.${method}()\` is not valid! Please refer to the documentation https://restapify.vercel.app/docs#fakerjs-integration`
        }
        throw new Error(JSON.stringify(errorObject))
      }
    })
  }

  private configRoutesFromListedFiles = (): void => {
    // reset routes
    this.routes = {
      GET: {}, POST: {}, DELETE: {}, PUT: {}, PATCH: {}
    }

    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeData = getRoute(
        routeFilePath,
        this.rootDir,
        this.listedRouteFiles[routeFilePath]
      )
      const {
        route,
        method,
        stateVariable,
        body,
        getBody,
        header,
        isExtended,
        statusCode,
        fileContent
      } = routeData

      const routeExists = this.routes[method][route] !== undefined

      if (!routeExists) {
        this.routes[method][route] = {} as RouteData
      }

      if (stateVariable) {
        if (this.routes[method][route] === undefined) {
          this.routes[method][route] = {} as RouteData
        }

        if (this.routes[method][route].states === undefined) {
          this.routes[method][route].states = {}
        }

        // @ts-ignore
        this.routes[method][route].states[stateVariable] = withoutUndefinedFromObject({
          body,
          fileContent,
          header,
          isExtended,
          statusCode,
          getBody
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
      const routesSlug = Object.keys(this.routes[method])
      const sortedRoutesSlug = getSortedRoutesSlug(routesSlug)

      sortedRoutesSlug.forEach(route => {
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

    normalizedRoute = routeResolve(this.publicPath, normalizedRoute)

    const responseCallback = (req: any, res: any): void => {
      res.status(statusCode)
      res.header('Content-Type', 'application/json; charset=utf-8')

      if (header) {
        res.header(header)
      }

      let vars: {[key: string]: string} = {}
      routeVars.forEach(variable => {
        vars[variable] = req.params[variable]
      })

      try {
        const responseBody = routeData.getBody(vars, req.query)

        if (responseBody) {
          res.send(JSON.stringify(responseBody))
        } else {
          res.end()
        }
      } catch ({ message }) {
        res.status(500).set('Content-Type', 'text/html').send(JSON.parse(message).message.toString())
      }
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

  private customRun = (options: RunOptions = {}):void => {
    const {
      hard = true,
      startServer = true,
      openDashboard = true,
      hotWatch = true
    } = options

    try {
      if (hard) {
        this.configEventsCallbacks()
        this.checkpublicPath()
        this.checkRootDirectory()
      }

      this.listRouteFiles()
      this.checkJsonFiles()
      this.configRoutesFromListedFiles()

      if (startServer) {
        this.configServer()
        this.configDashboard()
        this.configInternalApi()
      }

      if (hard && hotWatch) this.configHotWatch()
      if (hard && this.autoOpenDashboard && startServer && openDashboard) this.openDashboard()
      if (hard && startServer) this.executeCallbacks('server:start')

      if (startServer) this.startServer()

      if (hard) this.executeCallbacks('start')
    } catch (error) {
      if (isJsonString(error.message)) {
        const { error: errorId, message } = JSON.parse(error.message)
        this.executeCallbacks('error', { error: errorId, message })
      } else {
        this.executeCallbacks('error', { error: 'ERR', message: error.message })
      }
    }
  }

  private configEventsCallbacks = ():void => {
    this.onError(({ error }) => {
      if (error === 'MISS:PORT') {
        this.port += 1
        this.restartServer({ hard: true })
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

  private closeServer = (): void => {
    this.server.close()
  }

  private closeChokidarWatcher = (): void => {
    this.chokidarWatcher.close()
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

  public getServedRoutes = (): {
    route: string,
    method: HttpVerb
  }[] => {
    this.customRun({
      startServer: false,
      openDashboard: false,
      hotWatch: false,
      hard: false
    })
    return getRoutesByFileOrderHelper(this.routes)
  }

  public openDashboard = (): void => {
    // open with delay so user has time to see the console output
    setTimeout(() => {
      open(`http://localhost:${this.port}/restapify`)
      this.executeCallbacksForSingleEvent('dashboard:open')
    }, OPEN_DASHBOARD_TIMEOUT)
  }

  public close = (): void => {
    if (this.server) this.closeServer()
    if (this.hotWatch && this.chokidarWatcher) this.closeChokidarWatcher()
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

  public run = (): void => {
    this.customRun()
  }
}

export default Restapify
