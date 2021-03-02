import Restapify, {
  RestapifyParams,
  RouteState,
  Routes,
  PrivateRouteState
} from './Restapify'
import { cli } from './cli/cli'

export * from './types/index'
export * from './Restapify'
export {
  cli,
  RestapifyParams,
  RouteState,
  Routes,
  PrivateRouteState
}

export default Restapify
