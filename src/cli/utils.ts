import * as chalk from 'chalk'
import * as boxen from 'boxen'

import { HttpVerb } from '../types'

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
  const apiBaseURLLink = chalk.blue(`http://localhost:${port}${apiBaseURL}`)
  const dashboardURLLink = chalk.blue(`http://localhost:${port}/restapify`)
  const apiBaseURLOutput = `📦mocked API is served from ${apiBaseURLLink}`
  const dashboardURLOutput = `🎛 dashboard is running on ${dashboardURLLink}`
  return boxen(`${apiBaseURLOutput}\n${dashboardURLOutput} `, { padding: 1, borderColor: 'magenta' })
}
