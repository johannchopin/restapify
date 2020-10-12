const { readdirSync, statSync, readFileSync } = require('fs')
const { join, resolve } = require('path')
const express = require('express')
const app = express()

app.get('/users/:userId', (req, res) => {
  res.send(req.params['userId'])
})

const HTTP_VERBS = ['get', 'put', 'delete', 'create']

const BASE = resolve(__dirname, '../test/api/')
 
const getDirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())
const getFiles = p => readdirSync(p).filter(f => statSync(join(p, f)).isFile())
 
const replaceAll = (str, find, replace) => {
 return str.split(find).join(replace)
}

const getVarsInPath = (path) => {
   const re = /\[([^}]+)\]/gi
   const match = path.match(re)
   return match !== null ? match : []
}

const getNormalizedApiRoute = (path, params) => {
  params.forEach(param => {
    path = replaceAll(path, param, `:${param.slice(1, -1)}`)
  })

  return path
}

const getRoute = (filePath, filename) => {
  const route = filePath.replace(BASE, '')
  const params = getVarsInPath(route)
  const apiRoute = getNormalizedApiRoute(route, params).replace(filename, '')
  const fileVariable = filename.split('.')[0]

  if (fileVariable === '*') {
    return apiRoute.slice(0, -1)
  }

  return apiRoute.split('/').slice(0, -1).join('/') + '/' + fileVariable
}

const configFile = (filePath, filename) => {
  const httpVerbInFilename = filename.split('.')[-2]
  const fileContent = readFileSync(filePath, 'utf8')
  const route = filePath.replace(BASE, '')
  const params = getVarsInPath(route)
  const apiRoute = getRoute(filePath, filename)

  const responseCallback = (req, res) => {
    let stringifyJson = fileContent

    params.forEach(variable => {
      stringifyJson = replaceAll(stringifyJson, variable, req.params[variable.slice(1, -1)])
    })

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
