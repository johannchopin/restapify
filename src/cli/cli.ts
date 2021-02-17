import * as path from 'path'
import { Command } from 'commander'

import * as packageJson from '../../package.json'

import { listRoutes } from './run/listRoutes'
import { startServer } from './run/startServer'
import { startServerFromConfig } from './run/startServerFromConfig'

export const cli = (cliArgs: string[]): void => {
  const program = new Command()

  program
    .version(packageJson.version, '-v, --version', 'output the current version')
    .option('-p, --port <number>', 'port to serve Restapify instance')
    .option('-b, --baseUrl <string>', 'base url to serve the API')
    .option('-o, --open', 'open dashboard on server start', true)
    .option('--no-open', 'don\'t open dashboard on server start')

  program
    .command('serve <rootDir>')
    .description('serve a mocked API from folder <rootDir>')
    .action((rootDir, options): void => {
      startServer({
        rootDir: path.resolve(rootDir),
        baseUrl: options.parent.baseUrl,
        port: options.parent.port,
        openDashboard: options.parent.open
      })
    })

  program
    .command('list <rootDir>')
    .description('list all routes to serve from folder <rootDir>')
    .action((rootDir): void => {
      listRoutes(path.resolve(rootDir))
    })

  program
    .arguments('[pathToConfig]')
    .action((pathToConfig = './restapify.config.json'): void => {
      startServerFromConfig(path.resolve(pathToConfig))
    })

  program.parse(cliArgs)
}
