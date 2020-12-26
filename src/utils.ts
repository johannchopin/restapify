import * as fs from 'fs'
import * as path from 'path'

import { HTTP_VERBS } from './CONST'
import { HttpVerb } from './types'
import { Routes } from './Restapify'

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

interface OrderedRoutes {
  route: string,
  method: HttpVerb
}
export const getRoutesByFileOrder = (routes: Routes): OrderedRoutes[] => {
  const orderedRoutes: OrderedRoutes[] = []
  let routesLink: string[] = []

  HTTP_VERBS.forEach(method => {
    routesLink = [...routesLink, ...Object.keys(routes[method])]
  })

  // remove duplicates and sort
  routesLink = [...new Set(routesLink)].sort()

  routesLink.forEach(routeLink => {
    HTTP_VERBS.forEach(method => {
      if (routes[method][routeLink]) {
        orderedRoutes.push({ method, route: routeLink })
      }
    })
  })

  return orderedRoutes
}
