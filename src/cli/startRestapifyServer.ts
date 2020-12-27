import * as path from 'path'
import * as chalk from 'chalk'

import Restapify, { RestapifyParams } from '../Restapify'
import { getInstanceOverviewOutput, getMethodOutput, onRestapifyInstanceError } from './utils'

export const startRestapifyServer = (options: RestapifyParams): void => {
  const {
    rootDir,
    port,
    baseUrl,
    openDashboard
  } = options

  const RestapifyInstance = new Restapify({
    rootDir: path.resolve(rootDir),
    port: port,
    baseUrl: baseUrl,
    openDashboard: openDashboard
  })
  RestapifyInstance.on('server:start', () => {
    console.log(`\n🏗 Try to serve on port ${RestapifyInstance.port}`)
  })

  RestapifyInstance.onError(({ error }) => {
    onRestapifyInstanceError(error, {
      rootDir: RestapifyInstance.rootDir,
      apiBaseUrl: RestapifyInstance.apiBaseUrl,
      port: RestapifyInstance.port
    })
  })

  RestapifyInstance.on('start', () => {
    const servedRoutes = RestapifyInstance.getServedRoutes()

    servedRoutes.forEach(servedRoute => {
      let methodOutput = getMethodOutput(servedRoute.method)

      console.log(`${methodOutput} ${servedRoute.route}`)
    })

    console.log(getInstanceOverviewOutput(
      RestapifyInstance.port,
      RestapifyInstance.apiBaseUrl
    ))
  })

  RestapifyInstance.on('server:restart', () => {
    console.log(chalk.green('✅ API updated!'))
  })

  RestapifyInstance.run()
}
