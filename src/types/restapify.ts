export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' |'PATCH'
export type RestapifyEventName = 'error'
  | 'warning'
  | 'start'
  | 'server:start'
  | 'server:restart'
  | 'dashboard:open'
export type RestapifyErrorName = 'INV:JSON_FILE' // json file can't be parsed
  | 'MISS:ROOT_DIR' // given root directory is missing
  | 'MISS:PORT' // given port is not available
  | 'INV:API_BASEURL' // given api base url is needed for internal purposes (ex: `/restapify`)
export type RestapifyErrorCallbackParam = {
  error: RestapifyErrorName
}
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam
export type RestapifyEventCallback = (params?: RestapifyEventCallbackParam) => void
