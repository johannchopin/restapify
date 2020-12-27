import * as chalk from 'chalk'
import * as boxen from 'boxen'

import { HttpVerb, RestapifyErrorName } from '../types'
import Restapify from '../Restapify'

export const getMethodOutput = (method: HttpVerb): string => {
  let methodOutput

  switch (method) {
  case 'DELETE':
    methodOutput = chalk.red
    break
  case 'POST':
    methodOutput = chalk.yellow
    break
  case 'PUT':
    methodOutput = chalk.blue
    break
  case 'PATCH':
    methodOutput = chalk.gray
    break

  default: case 'GET':
    methodOutput = chalk.green
    break
  }

  let methodName = method
  let methodNameLength = method.length

  for (let index = 0; index < (6 - methodNameLength); index += 1) {
    methodName += ' '
  }

  methodOutput = methodOutput.bold(`${methodName}`)

  return methodOutput
}

export const getInstanceOverviewOutput = (port: number, apiBaseURL: string): string => {
  const runningTitle = chalk.magenta('🚀 Restapify is running:')
  const apiBaseURLTitle = chalk.bold('- 📦API base url:')
  const apiBaseURLLink = chalk.blueBright(`http://localhost:${port}${apiBaseURL}`)
  const dashboardURLTitle = chalk.bold('- 🎛 Dashboard:')
  const dashboardURLLink = chalk.blueBright(`http://localhost:${port}/restapify`)
  const apiBaseURLOutput = `${apiBaseURLTitle} ${apiBaseURLLink}`
  const dashboardURLOutput = `${dashboardURLTitle} ${dashboardURLLink}`
  return boxen(`${runningTitle}\n\n${apiBaseURLOutput}\n${dashboardURLOutput} `, { padding: 1, borderColor: 'magenta' })
}

export const onRestapifyInstanceError = (
  error: RestapifyErrorName,
  instanceData: Pick<Restapify, 'apiBaseUrl' | 'port' | 'rootDir'>
): void => {
  const { rootDir, port } = instanceData
  let logMessage
  const errorPrepend = chalk.red.bold.underline('\n❌ERROR:')
  switch (error) {
  case 'MISS:ROOT_DIR':
    logMessage = `${errorPrepend} The given folder ${rootDir} doesn't exist!`
    break

  case 'MISS:PORT':
    logMessage = `${errorPrepend} port ${port} is already in use!`
    break

  default:
    break
  }

  console.log(logMessage)
}
