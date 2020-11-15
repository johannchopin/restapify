import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as http from 'http'

import { replaceAll } from '../utils'
import { getVarsInPath } from './utils/server'

const NUMBER_CAST_INDICATOR = '(number)'
const DEFAULT_PORT = 6767

const getDirs = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
}
const getFiles = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())
}

export interface RestApiFyParams {
  rootDir: string
  port?: number
  apiPrefix?: string
}

class RestApiFy {
  protected app: express.Express
  protected server: any
  public entryFolderPath: string
  public port: number
  public entryFolderFullPath: string
  public apiPrefix: string

  constructor({
    rootDir,
    port = DEFAULT_PORT,
    apiPrefix = '/api'
  }: RestApiFyParams) {
    this.entryFolderPath = rootDir
    this.entryFolderFullPath = path.resolve(__dirname, rootDir)
    this.port = port
    this.apiPrefix = apiPrefix

    this.init()
  }

  private init = (): void => {
    this.check()
    this.configServer()
    this.run()
  }

  private configServer = (): void => {
    this.app = express()
    this.server = http.createServer(this.app)
    this.handleHttpServerErrors()
    this.configFolder(this.entryFolderPath)
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
      this.configFile(path.resolve(folderPath, filename), filename)
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

  private getNormalizedApiRoute = (route: string, params: string[]): string => {
    params.forEach(param => {
      route = replaceAll(route, `[${param}]`, `:${param}`)
    })

    return route
  }

  private getRoute = (filePath: string, filename: string): string => {
    const route = `${this.apiPrefix}${filePath.replace(this.entryFolderFullPath, '')}`
    const params = getVarsInPath(route)
    const apiRoute = this.getNormalizedApiRoute(route, params).replace(filename, '')
    const fileVariable = filename.split('.')[0]
    const varInFilename = getVarsInPath(fileVariable)[0]

    if (varInFilename) {
      return apiRoute.split('/').slice(0, -1).join('/') + '/:' + varInFilename
    }

    if (fileVariable === '*') {
      return apiRoute.slice(0, -1)
    }

    return apiRoute.split('/').slice(0, -1).join('/') + '/' + fileVariable
  }

  private configFile = (filePath: string, filename: string): void => {
    const httpVerbInFilename = filename.split('.').slice(-2)[0]
    let fileContent = fs.readFileSync(filePath, 'utf8')
    const route = filePath.replace(this.entryFolderFullPath, '')
    const numberParamsToCast = this.getNumbersToCast(fileContent)
    const params = getVarsInPath(route)
    const apiRoute = this.getRoute(filePath, filename)

    numberParamsToCast.forEach(numberParamToCast => {
      fileContent = replaceAll(
        fileContent,
        numberParamToCast,
        numberParamToCast.slice(`"${NUMBER_CAST_INDICATOR}`.length, -1)
      )
    })

    const responseCallback = (req: any, res: any): void => {
      const json = JSON.parse(fileContent)
      let body

      if (json.__header || json.__body) {
        if (json.__header) {
          res.header(json.__header)
        }

        if (json.__body) {
          let stringifiedBody = JSON.stringify(json.__body)

          params.forEach(variable => {
            stringifiedBody = replaceAll(
              stringifiedBody,
              `[${variable}]`,
              req.params[variable]
            )
          })

          body = JSON.parse(stringifiedBody)
        }

        res.send(body)
      } else {
        let stringifiedJson = fileContent

        params.forEach(variable => {
          stringifiedJson = replaceAll(stringifiedJson, `[${variable}]`, req.params[variable])
        })

        res.send(JSON.parse(stringifiedJson))
      }
    }

    switch (httpVerbInFilename) {
    case 'POST':
      this.app.post(apiRoute, responseCallback)
      console.log(`> POST ${apiRoute}`)
      break

    case 'DELETE':
      this.app.delete(apiRoute, responseCallback)
      console.log(`> DELETE ${apiRoute}`)
      break

    case 'PUT':
      this.app.put(apiRoute, responseCallback)
      console.log(`> PUT ${apiRoute}`)
      break

    case 'GET': default:
      this.app.get(apiRoute, responseCallback)
      console.log(`> GET ${apiRoute}`)
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

  public close = (): void => {
    console.log('Server stopped')
    this.server.close()
  }

  public kill = (): void => {
    process.exit(0)
  }
}

export default RestApiFy
