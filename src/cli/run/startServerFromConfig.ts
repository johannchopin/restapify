import * as path from 'path'
import { ValidationError } from 'jsonschema'

import { RestapifyParams } from '../../index'
import { consoleError, runServer, validateConfig } from '../utils'

export const outputInvalidFilePathError = (filePath: string): void => {
  consoleError(`The given path ${filePath} is not a valid configuration file!`)
}

const outputConfigErrors = (errors: ValidationError[]): void => {
  consoleError('Invalid configuration file:')

  errors.forEach(error => {
    console.log(`- ${error.message}`)
  })
}

export const startServerFromConfig = (configFilePath: string, config: RestapifyParams): void => {
  try {
    const validatedConfig = validateConfig(config)

    if (!validatedConfig.valid) {
      outputConfigErrors(validatedConfig.errors)
      return
    }

    const { rootDir, openDashboard = true, ...configsRest } = config

    runServer({
      rootDir: path.join(path.dirname(configFilePath), rootDir),
      openDashboard,
      ...configsRest
    })
  } catch (error) {
    outputInvalidFilePathError(configFilePath)
  }
}
