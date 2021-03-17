import * as fs from 'fs'
import * as path from 'path'
import { ValidationError } from 'jsonschema'

import { RestapifyParams } from '../../index'
import { consoleError, runServer, validateConfig } from '../utils'

const outputInvalidFilePathError = (filePath: string): void => {
  consoleError(`The given path ${filePath} is not a valid configuration file!`)
}

const outputConfigErrors = (errors: ValidationError[]): void => {
  consoleError('Invalid configuration file:')

  errors.forEach(error => {
    console.log(`- ${error.message}`)
  })
}

export const startServerFromConfig = (configFilePath: string): void => {
  const configFileExists = fs.existsSync(configFilePath)

  if (!configFileExists) {
    consoleError(`The given configuration file ${configFilePath} doesn't exist!`)
    return
  }

  try {
    const configFileContent = fs.readFileSync(configFilePath, 'utf8')
    const config = JSON.parse(configFileContent) as RestapifyParams

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
