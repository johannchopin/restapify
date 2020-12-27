import { HttpVerb } from './types'

import { replaceAll } from './utils'
import { CURRENT_LOCATION_ROUTE_SELECTOR, NUMBER_CAST_INDICATOR } from './CONST'
import {
  getVarsInPath,
  isHttpVerb,
  isNumeric,
  isStateVariable
} from './utils'

// I N T E R F A C E S
export interface Route {
  route: string
  normalizedRoute: string
  routeVars: string[]
  filename: string
  fileContent: string
  method: HttpVerb
  statusCode: number
  stateVars: string[]
  isExtended: boolean
  header?: {[key: string]: string | number}
  body?: string
  getBody: (vars: {[key: string]: string}) => string
  states?: {
    [state: string]: Pick<Route, 'fileContent'
      | 'statusCode'
      | 'header'
      | 'body'
      | 'isExtended'
      | 'getBody'
    >
  }
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

export const getResponseStatusCodeInFilename = (filename: string): number => {
  const filenameElmts = filename.split('.')
  let potentialStatusCodeElement = filenameElmts.slice(1, -1) // remove local indicator and file extension

  while (potentialStatusCodeElement.length > 0) {
    const elmtToTest = potentialStatusCodeElement[0]
    if (isHttpVerb(elmtToTest) || isStateVariable(elmtToTest)) {
      potentialStatusCodeElement = potentialStatusCodeElement.slice(1)
    } else {
      if (isNumeric(elmtToTest)) {
        return Number(elmtToTest)
      }
      potentialStatusCodeElement = potentialStatusCodeElement.slice(1)
    }
  }

  return 200
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

export const getHttpMethodInFilename = (filename: string): HttpVerb => {
  const filenameElmts = filename.split('.')
  let potentialHttpVerbElement = filenameElmts.slice(1, -1) // remove local indicator and file extension
  let httpVerb: HttpVerb = 'GET'

  potentialHttpVerbElement.forEach(elmt => {
    if (isHttpVerb(elmt)) {
      httpVerb = elmt as HttpVerb
    }
  })

  return httpVerb
}

export const getContentWithReplacedVars = (
  content: string,
  vars: {[key: string]: string}
): string => {
  const getEscapedVar = (variable: string): string => {
    return `\`[${variable}]\``
  }

  const getVarsToEscape = (): string[] => {
    return Object.keys(vars).filter(variable => {
      return content.includes(getEscapedVar(variable))
    })
  }

  const varsToEscape = getVarsToEscape()

  const getContentWithSanitizedEscapedVars = (contentToSanitize: string): string => {
    varsToEscape.forEach(escapedVar => {
      contentToSanitize = replaceAll(
        contentToSanitize,
        getEscapedVar(escapedVar),
        getEscapedVar(`__${escapedVar}__`)
      )
    })

    return contentToSanitize
  }

  const getContentWithUnsanitizedEscapedVars = (contentToUnsanitize: string): string => {
    varsToEscape.forEach(escapedVar => {
      contentToUnsanitize = replaceAll(
        contentToUnsanitize,
        getEscapedVar(`__${escapedVar}__`),
        `[${escapedVar}]`
      )
    })

    return contentToUnsanitize
  }

  // sanitize variables to escape
  content = getContentWithSanitizedEscapedVars(content)

  Object.keys(vars).forEach((variable) => {
    // replace number casted variables
    content = replaceAll(content, `"${NUMBER_CAST_INDICATOR}[${variable}]"`, vars[variable])
    // replace simple variables
    content = replaceAll(content, `[${variable}]`, vars[variable])
  })

  // unsanitize variables to escape
  content = getContentWithUnsanitizedEscapedVars(content)

  return content
}

export const isStructureExtended = (jsonContent: {[key: string]: any}): boolean => {
  return jsonContent.__header !== undefined || jsonContent.__body !== undefined
}

export const getRoute = (
  filePath: string,
  entryFolderPath: string,
  fileContent: string
): Route => {
  // relative to the entry folder
  const relativeFilePath = filePath.replace(entryFolderPath, '')
  const filename = getFilenameFromFilePath(relativeFilePath)
  const route = getRouteFromFilePath(relativeFilePath)
  const routeVars = getVarsInPath(route)
  const normalizedRoute = getNormalizedRoute(route, routeVars)
  const jsonContent = JSON.parse(fileContent)
  const stateVars = getStateVarsInFilename(filename)
  const statusCode = getResponseStatusCodeInFilename(filename)
  const method = getHttpMethodInFilename(filename)

  const isExtended = isStructureExtended(jsonContent)

  const header = jsonContent.__header

  const getBodyValue = (): string | undefined => {
    if (fileContent === '[null]') {
      return undefined
    }

    return isExtended ? JSON.stringify(jsonContent.__body) : fileContent
  }

  const body = getBodyValue()

  const getBody = (varsToReplace?: {[key: string]: string}): string => {
    if (varsToReplace && body) {
      return getContentWithReplacedVars(body, varsToReplace)
    }

    return fileContent
  }

  return {
    route,
    routeVars,
    normalizedRoute,
    isExtended,
    filename,
    fileContent,
    stateVars,
    statusCode,
    method,
    body,
    header,
    getBody
  }
}
