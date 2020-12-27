import * as arg from 'arg'
import * as path from 'path'

import Restapify from '../Restapify'
import { getInstanceOverviewOutput, getMethodOutput, onRestapifyInstanceError } from './utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const cli = ([nodePath, scriptPath, entryFolder, ...cliArgs]: string[]): void => {
  const args = arg({
    '--help': Boolean,
    '-h': '--help',

    '--port': Number,
    '-p': '--port',

    '--baseURL': String,
    '-b': '--baseURL',

    '--no-open': Boolean
  }, { argv: cliArgs })

  const {
    '--port': port,
    '--baseURL': baseURL,
    '--no-open': noOpen = false
  } = args

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const RestapifyInstance = new Restapify({
    rootDir: path.resolve(entryFolder),
    port,
    baseURL,
    openDashboard: !noOpen
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

  RestapifyInstance.run()
}
