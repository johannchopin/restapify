export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' |'PATCH'
export type RestapifyEventName = 'error' | 'warning' | 'start' | 'server:start' | 'dashboard:open'
export type RestapifyErrorName = 'INV:JSON_FILE' // json file can't be parsed
  | 'MISS:ROOT_DIR' // given root directory is missing
export type RestapifyErrorCallbackParam = {
  error: RestapifyErrorName
}
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam
export type RestapifyEventCallback = (params?: RestapifyEventCallbackParam) => void
