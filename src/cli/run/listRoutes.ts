import Restapify from '../../Restapify'

import { getRoutesListOutput, onRestapifyInstanceError } from '../utils'

export const listRoutes = (rootDir: string): void => {
  const rpfy = new Restapify({
    rootDir,
    openDashboard: false,
    hotWatch: false
  })

  rpfy.onError(({ error }) => {
    onRestapifyInstanceError(error, {
      rootDir: rpfy.rootDir,
      apiBaseUrl: rpfy.apiBaseUrl,
      port: rpfy.port
    })
  })

  const servedRoutesOutput = getRoutesListOutput(
    rpfy.getServedRoutes(),
    rpfy.apiBaseUrl
  )

  console.log(servedRoutesOutput)
}
