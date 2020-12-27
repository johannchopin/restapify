import * as path from 'path'
import * as chalk from 'chalk'
import { program } from 'commander'

import * as packageJson from '../../package.json'

import Restapify, { RestapifyParams } from '../Restapify'
import { getInstanceOverviewOutput, getMethodOutput, onRestapifyInstanceError } from './utils'

const startRestapifyServer = (options: RestapifyParams): void => {
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

export const cli = (cliArgs: string[]): void => {
  program
    .version(packageJson.version, '-v, --version', 'output the current version')
    .option('-p, --port <number>', 'port to serve Restapify instance')
    .option('-b, --baseUrl <string>', 'base url to serve the API')
    .option('-o, --open', 'open dashboard on server start', true)
    .option('--no-open', 'don\'t open dashboard on server start')

  program
    .command('serve <rootDir>')
    .description('serve a mocked API from folder <rootDir>')
    .action((rootDir, options) => {
      startRestapifyServer({
        rootDir,
        baseUrl: options.parent.baseUrl,
        port: options.parent.port,
        openDashboard: options.parent.open
      })
    })

  program.parse(cliArgs)
}
