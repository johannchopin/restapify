import * as arg from 'arg'
import * as path from 'path'

import Restapify from '../server'

export const cli = (cliArgs: string[]): void => {
  const args = arg({
    // Types
    '--help': Boolean,
    '-h': '--help',

    '--port': Number,
    '-p': '--port',

    '--baseURL': String,
    '--b': '--baseURL',

    '--dir': String,
    '-d': '--dir'
  }, { argv: cliArgs })

  const {
    '--dir': rootDir = '.',
    '--port': port,
    '--baseURL': baseURL
  } = args

  const RestapifyInstance = new Restapify({
    rootDir: path.resolve(rootDir),
    port,
    baseURL
  })
}
