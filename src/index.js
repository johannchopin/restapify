const { readdirSync, statSync, readFileSync } = require('fs')
const { join, resolve } = require('path')
const express = require('express')
const app = express()

const HTTP_VERBS = ['get', 'put', 'delete', 'create']
const NUMBER_CAST_INDICATOR = '(number)'

const BASE = resolve(__dirname, '../test/api/')
 
const getDirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())
const getFiles = p => readdirSync(p).filter(f => statSync(join(p, f)).isFile())
 
const replaceAll = (str, find, replace) => {
 return str.split(find).join(replace)
}

const getNumbersToCast = (string) => {
  const re = /\"\(number\)\[([^,}]+)\]\"/gi
  const match = string.match(re)

  return match !== null ? match : []
}

const getVarsInPath = (path) => {
  const vars = []
  const explodedPath = path.split('/')

  explodedPath.forEach(pathElement => {
    const isVar = pathElement.startsWith('[') && pathElement.endsWith(']')
    if (isVar) {
      vars.push(pathElement.slice(1, -1))
    }
  })

  return vars
}

const getNormalizedApiRoute = (path, params) => {
  params.forEach(param => {
    path = replaceAll(path, `[${param}]`, `:${param}`)
  })

  return path
}

const getRoute = (filePath, filename) => {
  const route = filePath.replace(BASE, '')
  const params = getVarsInPath(route)
  const apiRoute = getNormalizedApiRoute(route, params).replace(filename, '')
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

const configFile = (filePath, filename) => {
  const httpVerbInFilename = filename.split('.')[-2]
  let fileContent = readFileSync(filePath, 'utf8')
  const route = filePath.replace(BASE, '')
  const numberParamsToCast = getNumbersToCast(fileContent)
  const params = getVarsInPath(route)
  const apiRoute = getRoute(filePath, filename)

  numberParamsToCast.forEach(numberParamToCast => {
    console.log(numberParamToCast, numberParamToCast.slice(`"${NUMBER_CAST_INDICATOR}`.length, -1))
    fileContent = replaceAll(fileContent, numberParamToCast, numberParamToCast.slice(`"${NUMBER_CAST_INDICATOR}`.length, -1))
  })

  const responseCallback = (req, res) => {
    let stringifyJson = fileContent

    params.forEach(variable => {
      stringifyJson = replaceAll(stringifyJson, variable, req.params[variable])
    })

    console.log(stringifyJson)
    res.send(JSON.parse(stringifyJson))
  }

  switch (httpVerbInFilename) {
    case 'post':
      app.post(apiRoute, responseCallback)
      console.log(`> POST ${apiRoute}`)
      break
  
    case 'delete':
      app.delete(apiRoute, responseCallback)
      console.log(`> DELETE ${apiRoute}`)
      break
    
    case 'put':
      app.put(apiRoute, responseCallback)
      console.log(`> PUT ${apiRoute}`)
      break
    
    case 'get': default:
      app.get(apiRoute, responseCallback)
      console.log(`> GET ${apiRoute}`)
      break
  }
}

const configFolder = (folderPath) => {
  const dirs = getDirs(folderPath)
  const files = getFiles(folderPath)

  files.forEach(filename => {
    configFile(resolve(folderPath, filename), filename)
  })

  dirs.forEach(dir => {
    configFolder(resolve(folderPath, dir))
  })
}

configFolder(BASE)

app.listen(3000)
console.log('Express started on port localhost:3000')
