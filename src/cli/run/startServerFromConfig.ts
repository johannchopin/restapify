import * as fs from 'fs'
import * as path from 'path'
import { ValidationError } from 'jsonschema'

import { consoleError, runServer, validateConfig } from '../utils'

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

  const configFileContent = fs.readFileSync(configFilePath, 'utf8')

  const config = JSON.parse(configFileContent)

  const validatedConfig = validateConfig(config)

  if (!validatedConfig.valid) {
    outputConfigErrors(validatedConfig.errors)
    return
  }

  runServer({
    ...config,
    rootDir: path.join(path.dirname(configFilePath), config.rootDir)
  })
}
