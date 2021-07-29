import { Route as RouteData } from '../getRoute'
import { HttpVerb } from '.'

export type Route = Pick<RouteData,
  'fileContent'
  | 'body'
  | 'route'
  | 'method'
  | 'filename'
  | 'header'
  | 'routeVars'
  | 'stateVariable'
  | 'statusCode'
>

export type GetRoutes = {
  [url: string]: {
    [method in HttpVerb]: RouteData
  }
}
