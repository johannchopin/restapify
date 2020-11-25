import { Route as RouteData } from '../server/getRoute'
import { HttpVerb } from '.'

export type Route = Pick<RouteData,
  'fileContent'
  | 'body'
  | 'route'
  | 'method'
  | 'filename'
  | 'header'
  | 'routeVars'
  | 'stateVars'
  | 'statusCode'
>

export type Routes = {
  [url: string]: {
    [method in HttpVerb]: RouteData
  }
}
