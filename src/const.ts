import { HttpVerb } from './types'

export const CURRENT_LOCATION_ROUTE_SELECTOR = '*'
export const HTTP_VERBS: HttpVerb[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
export const INTERNAL_BASEURL = '/restapify'
export const INTERNAL_API_BASEURL = `${INTERNAL_BASEURL}/api`
export const DASHBOARD_FOLDER_PATH = './dashboard-public/'
export const NUMBER_CAST_INDICATOR = 'n:'
export const OPEN_DASHBOARD_TIMEOUT = 1000

// faker's syntax looks like `[faker:<...>]`
// ex: [faker:lorem:sentence], [faker:image:avatar]
export const FAKER_SYNTAX_PREFIX = '[faker:'
export const FAKER_SYNTAX_SUFIX = ']'
export const FAKER_SYNTAX_MATCHER = /\[faker:(.*?)\]/g
