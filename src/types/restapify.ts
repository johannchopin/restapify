export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' |'PATCH'
export type RestapifyEventName = 'error' | 'start' | 'server:start' | 'dashboard:open'
export type RestapifyErrorName = 'INV_JSON_FILE'
export type RestapifyErrorCallbackParam = {
  error: RestapifyErrorName
}
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam
export type RestapifyEventCallback = (params: RestapifyEventCallbackParam) => void
