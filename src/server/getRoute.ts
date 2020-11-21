import * as fs from 'fs'

import { replaceAll } from '../utils'
import { CURRENT_LOCATION_ROUTE_SELECTOR } from './CONST'
import { getVarsInPath } from './utils/server'

// I N T E R F A C E S
export interface RouteParams {
  filePath: string
  entryFolderPath: string
}
export interface Route {
  route: string
  normalizedRoute: string
  routeVars: string[]
  filename: string
  fileContent: string
  stateVars: string[]
  statusCode: number
  getFileContent: (vars: {[key: string]: string}) => string
}

export const getFilenameFromFilePath = (filePath: string): string => {
  const [filename] = filePath.split('/').slice(-1)

  return filename
}

export const getRouteFromFilePath = (filePath: string): string => {
  const filename = getFilenameFromFilePath(filePath)
  const routeWithoutFilename = filePath.replace(filename, '')
  const firstParamInFilename = filename.split('.')[0]

  if (firstParamInFilename === CURRENT_LOCATION_ROUTE_SELECTOR) {
    // remove last char which is a `/`
    return routeWithoutFilename.slice(0, -1)
  }

  return routeWithoutFilename + firstParamInFilename
}

export const getNormalizedRoute = (route: string, vars: string[] = []): string => {
  vars.forEach(variable => {
    route = replaceAll(route, `[${variable}]`, `:${variable}`)
  })

  return route
}

export const getStateVarsInFilename = (filename: string): string[] => {
  let stateVars: string[] = []
  const explodedFilename = filename.split('.')

  explodedFilename.forEach(filenameElement => {
    const isStateVar = filenameElement.startsWith('{') && filenameElement.endsWith('}')

    if (isStateVar) {
      stateVars = [...filenameElement.slice(1, -1).split('|')]
    }
  })

  return stateVars
}

export const getContentWithReplacedVars = (
  content: string,
  vars: {[key: string]: string}
): string => {
  Object.keys(vars).forEach((variable) => {
    content = replaceAll(
      content,
      `[${variable}]`,
      vars[variable]
    )
  })

  return content
}

export const getRoute = ({
  filePath,
  entryFolderPath
}: RouteParams): Route => {
  // relative to the entry folder
  const relativeFilePath = filePath.replace(entryFolderPath, '')
  const filename = getFilenameFromFilePath(relativeFilePath)
  const route = getRouteFromFilePath(relativeFilePath)
  const routeVars = getVarsInPath(route)
  const normalizedRoute = getNormalizedRoute(route, routeVars)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const stateVars = getStateVarsInFilename(filename)

  const getFileContent = (varsToReplace?: {[key: string]: string}): string => {
    if (varsToReplace) {
      return getContentWithReplacedVars(fileContent, varsToReplace)
    }

    return fileContent
  }

  return {
    route,
    routeVars,
    normalizedRoute,
    filename,
    fileContent,
    getFileContent,
    stateVars,
    statusCode: 200
  }
}
