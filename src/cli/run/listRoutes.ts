import Restapify from '../../Restapify'

import { getRoutesListOutput, onRestapifyInstanceError } from '../utils'

export const listRoutes = (rootDir: string): void => {
  const RestapifyInstance = new Restapify({
    rootDir,
    openDashboard: false,
    hotWatch: false
  })

  RestapifyInstance.onError(({ error }) => {
    onRestapifyInstanceError(error, {
      rootDir: RestapifyInstance.rootDir,
      apiBaseUrl: RestapifyInstance.apiBaseUrl,
      port: RestapifyInstance.port
    })
  })

  const servedRoutesOutput = getRoutesListOutput(
    RestapifyInstance.getServedRoutes(),
    RestapifyInstance.apiBaseUrl
  )

  console.log(servedRoutesOutput)
}
