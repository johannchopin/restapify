export type HttpMethod = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'PATCH'

export interface RouteResponse {
  body: string
  fileContent: string
  filename: string
  isExtended: boolean
  method: HttpMethod
  normalizedRoute: string
  route: string
  routeVars: string[]
  stateVars: string[]
  statusCode: number
  header?: {[key: string]: string | number}
  states?: {
    [state: string]: Pick<RouteResponse, 'fileContent'
      | 'statusCode'
      | 'body'
      | 'header'
    >
  }
}
export interface StateResponse {
  route: string
  state: string
  method?: HttpMethod
}

export interface GetRoutesResponse {
  [route: string]: {
    [method in HttpMethod]: RouteResponse
  }
}

export interface GetApiInfosResponse {
  port: number
  baseUrl: string
  routes: GetRoutesResponse
}

export type GetStatesResponse = StateResponse[]