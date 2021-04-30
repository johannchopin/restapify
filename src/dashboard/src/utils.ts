import type { RouteResponse } from "./types"

interface RouteComponent {
  type?: 'variable'
  value: string 
}

export const replaceAll = (str: string, find: string, replace: string): string => {
  return str.split(find).join(replace)
}

export const getRouteSectionId = (route: RouteResponse): string => {
  return route.method + replaceAll(route.route, '/', '-')
}

export const getRouteStructure = (route): RouteComponent[] => {
const routeComponents = route.split('/')
return routeComponents
  .filter(routeComponent => {
    return routeComponent.trim().length > 0
  })
  .map(routeComponent => {
    const isVariable = routeComponent.startsWith('[') && routeComponent.endsWith(']')
      return {
        type: isVariable ? 'variable' : undefined,
        value: routeComponent
      }
    })
}

export const getStatusColorClass = (statusCode: number): string => {
  if (statusCode < 300) {
    return 'text-success'
  }

  if (statusCode < 400) {
    return 'text-warning'
  }

  return 'text-danger'
}
