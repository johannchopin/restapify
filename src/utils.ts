import * as fs from 'fs'
import * as path from 'path'

import { HTTP_VERBS } from './CONST'

export const getDirs = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
}

export const getFiles = (p: string): string[] => {
  return fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile())
}

export const replaceAll = (str: string, find: string, replace: string): string => {
  return str.split(find).join(replace)
}

export const getVarsInPath = (pathParam: string): string[] => {
  const vars: string[] = []

  if (pathParam.endsWith('.json')) {
    pathParam = pathParam.slice(0, -'.json'.length)
  }

  const explodedPath = pathParam.split('/')

  explodedPath.forEach(pathElement => {
    const isVar = pathElement.startsWith('[') && pathElement.endsWith(']')
    if (isVar) {
      vars.push(pathElement.slice(1, -1))
    }
  })

  return vars
}

export const isHttpVerb = (str: string): boolean => {
  // @ts-ignore
  return HTTP_VERBS.includes(str)
}

export const isStateVariable = (str: string): boolean => {
  return str.startsWith('{') && str.endsWith('}')
}

export const isNumeric = (str:string):boolean=> {
  return !Number.isNaN(str) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         && !Number.isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export const routeResolve = (...routes: string[]): string => {
  let finalRoute = ''

  routes.forEach((route, routeId) => {
    const hasPreviousRouteFinalSlash = !!routes[routeId - 1]?.endsWith('/')
    const hasRouteFirstSlash = route.startsWith('/')

    if (hasPreviousRouteFinalSlash && hasRouteFirstSlash) {
      finalRoute += route.slice(1)
    } else if (!hasPreviousRouteFinalSlash && !hasRouteFirstSlash) {
      finalRoute += '/' + route
    } else {
      finalRoute += route
    }
  })

  return finalRoute
}

export const withoutUndefinedFromObject = (obj: Object): Object => {
  // @ts-ignore
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
  return obj
}
