import chalk from 'chalk'
import boxen from 'boxen'
import { Validator, ValidatorResult } from 'jsonschema'

import Restapify, { RestapifyParams, HttpVerb, RestapifyErrorCallbackParam } from '../index'

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

export const consoleError = (message: string): void => {
  const errorPrepend = chalk.red.bold.underline('❌ERROR:')
  console.log(`${errorPrepend} ${message}`)
}

export const getInstanceOverviewOutput = (port: number, publicPath: string): string => {
  if (!publicPath.startsWith('/')) {
    publicPath = `/${publicPath}`
  }

  const runningTitle = chalk.magenta('🚀 Restapify is running:')
  const publicPathTitle = chalk.bold('- 📦API entry point:')
  const publicPathLink = chalk.blueBright(`http://localhost:${port}${publicPath}`)
  const dashboardURLTitle = chalk.bold('- 🎛 Dashboard:')
  const dashboardURLLink = chalk.blueBright(`http://localhost:${port}/restapify`)
  const publicPathOutput = `${publicPathTitle} ${publicPathLink}`
  const dashboardURLOutput = `${dashboardURLTitle} ${dashboardURLLink}`
  const killProcessInfo = chalk.yellowBright('Use Ctrl+C to quit this process')
  return boxen(`${runningTitle}\n\n${publicPathOutput}\n${dashboardURLOutput}\n\n${killProcessInfo}`, { padding: 1, borderColor: 'magenta' })
}

export const onRestapifyInstanceError = (
  errorObject: RestapifyErrorCallbackParam,
  instanceData: Pick<Restapify, 'publicPath' | 'port' | 'rootDir'>
): void => {
  const { error, message } = errorObject
  const { rootDir, port, publicPath } = instanceData

  if (error.startsWith('MISS:ROOT_DIR')) {
    consoleError(`The given folder ${rootDir} doesn't exist!`)
  } else if (error.startsWith('MISS:PORT')) {
    consoleError(`port ${port} is already in use!`)
  } else if (error.startsWith('INV:API_BASEURL')) {
    consoleError(`Impossible to use ${publicPath} as the API base URL since it's already needed for internal purposes!`)
  } else if (error.startsWith('INV:JSON_FILE')) {
    consoleError(message as string)
  } else if (error.startsWith('INV:FAKER_SYNTAX')) {
    consoleError(message as string)
  }
}

export const getRoutesListOutput = (
  routesList: { route: string; method: HttpVerb; }[],
  publicPath: string
): string => {
  let output = ''

  routesList.forEach(servedRoute => {
    let methodOutput = getMethodOutput(servedRoute.method)

    output += `\n${methodOutput} ${publicPath}${servedRoute.route}`
  })

  return output
}

export const runServer = (config: RestapifyParams): void => {
  const rpfy = new Restapify(config)

  rpfy.on('server:start', () => {
    console.log(`\n🏗 Try to serve on port ${rpfy.port}`)
  })

  rpfy.onError((error) => {
    onRestapifyInstanceError(error, {
      rootDir: rpfy.rootDir,
      publicPath: rpfy.publicPath,
      port: rpfy.port
    })
  })

  rpfy.on('start', () => {
    const servedRoutesOutput = getRoutesListOutput(
      rpfy.getServedRoutes(),
      rpfy.publicPath
    )

    console.log(servedRoutesOutput)
    console.log(getInstanceOverviewOutput(
      rpfy.port,
      rpfy.publicPath
    ))
  })

  rpfy.on('server:restart', () => {
    console.log(chalk.green('✅ API updated!'))
  })

  rpfy.run()
}

export const validateConfig = (config: object): ValidatorResult => {
  const jsonValidor = new Validator()
  const CONFIG_FILE_SCHEMA = {
    type: 'object',
    rootDir: { type: 'string' },
    publicPath: { type: 'string' },
    port: { type: 'number' },
    states: {
      properties: {
        route: 'string',
        method: 'string',
        state: 'string'
      },
      required: ['route', 'method', 'state']
    },
    required: ['rootDir']
  }

  return jsonValidor.validate(config, CONFIG_FILE_SCHEMA)
}
