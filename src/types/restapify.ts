import { Json, JsonCompatible } from './json'

export type SupportedFileExtension = 'json' | 'yml'
export type CastingOperator = 'number' | 'boolean'
export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' |'PATCH'
export type RestapifyEventName = 'error'
  | 'warning'
  | 'start'
  | 'server:start'
  | 'server:restart'
  | 'dashboard:open'
export type RestapifyErrorName = 'INV:JSON_FILE' // json file can't be parsed
  | 'INV:YAML_FILE' // yaml file can't be parsed
  | 'MISS:ROOT_DIR' // given root directory is missing
  | 'MISS:PORT' // given port is not available
  | 'INV:API_BASEURL' // given api base url is needed for internal purposes (ex: `/restapify`)
  | 'INV:FAKER_SYNTAX' // there is an invalid call to the fakerjs library
  | 'ERR' // Unhandled error catch
export type RestapifyErrorCallbackParam = {
  error: RestapifyErrorName
  message?: string
}
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam
export type RestapifyEventCallback = (params?: RestapifyEventCallbackParam) => void
export type JsonRouteFileContent = JsonCompatible<{
  '#body'?: Json
  '#header'?: Json
}>

export interface FakerSyntaxData {
  namespace: string
  method: string
}

export interface RouteFile {
  type: SupportedFileExtension
  content: string
}
