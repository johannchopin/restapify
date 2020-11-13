import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as portscanner from 'portscanner'

import { getVarsInPath } from './utils/server'

const NUMBER_CAST_INDICATOR = '(number)'
const LOCALHOST = '127.0.0.1'
const DEFAULT_PORT = 6767

const getDirs = (p: string) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
const getFiles = (p: string) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())

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

      this.check(() => {
        this.configServer()
        this.run()
      })
  }

  private configServer = (): void => {
    this.app = express()
    this.configFolder(this.entryFolderPath)
  }

  private check = (onSuccess: () => void): void => {
    this.checkEntryFolder()
    this.checkPort(onSuccess)
  }

  private checkPort = (onSuccess: () => void): void => {
    portscanner.checkPortStatus(this.port, LOCALHOST, (error, status) => {
      if (status !== 'closed') {
        console.log('Port already in use')
        portscanner.findAPortNotInUse(DEFAULT_PORT, DEFAULT_PORT + 1000, LOCALHOST, (error, port) => {
          console.log('Use port: ' + port)
          this.port = port

          onSuccess()
        })      
      } else {
        onSuccess()
      }
    })
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
    const re = /\"\(number\)\[([^,}]+)\]\"/gi
    const match = str.match(re)
  
    return match !== null ? match : []
  }
  
  private getNormalizedApiRoute = (path: string, params: string[]): string => {
    params.forEach(param => {
      path = replaceAll(path, `[${param}]`, `:${param}`)
    })

    return path
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
    const httpVerbInFilename = filename.split('.')[-2]
    let fileContent = fs.readFileSync(filePath, 'utf8')
    const route = filePath.replace(this.entryFolderFullPath, '')
    const numberParamsToCast = this.getNumbersToCast(fileContent)
    const params = getVarsInPath(route)
    console.log(params)
    const apiRoute = this.getRoute(filePath, filename)

    numberParamsToCast.forEach(numberParamToCast => {
      fileContent = replaceAll(fileContent, numberParamToCast, numberParamToCast.slice(`"${NUMBER_CAST_INDICATOR}`.length, -1))
    })
  
    const responseCallback = (req: any, res: any) => {
      let stringifyJson = fileContent
  
      params.forEach(variable => {
        console.log(stringifyJson, `[${variable}]`, req.params[variable])
        stringifyJson = replaceAll(stringifyJson, `[${variable}]`, req.params[variable])
      })

      console.log(stringifyJson)

      res.send(JSON.parse(stringifyJson))
    }
  
    switch (httpVerbInFilename) {
      case 'post':
        this.app.post(apiRoute, responseCallback)
        console.log(`> POST ${apiRoute}`)
        break
    
      case 'delete':
        this.app.delete(apiRoute, responseCallback)
        console.log(`> DELETE ${apiRoute}`)
        break
      
      case 'put':
        this.app.put(apiRoute, responseCallback)
        console.log(`> PUT ${apiRoute}`)
        break
      
      case 'get': default:
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
    this.server = this.app.listen(this.port)
  }

  public close = (): void => {
    console.log(`Server stopped`)
    this.server.close()
  }

  public kill = (): void => {
    process.exit(0)
  }
}

const replaceAll = (str: string, find: string, replace: string): string => {
 return str.split(find).join(replace)
}

export default RestApiFy