import { program } from 'commander'

import * as packageJson from '../../package.json'

import { startRestapifyServer } from './startRestapifyServer'

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
