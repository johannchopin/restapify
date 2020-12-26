import * as arg from 'arg'
import * as path from 'path'

import Restapify from '../Restapify'

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
}
