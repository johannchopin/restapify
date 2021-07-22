import { HttpVerb, JsonRouteFileContent } from './types'

import { replaceAll, replaceAllCastedVar } from './utils'
import {
  CURRENT_LOCATION_ROUTE_SELECTOR,
  HEADER_SYNTAX,
  BODY_SYNTAX,
  EMPTY_BODY_SYNTAX,
  QUERY_STRING_VAR_MATCHER,
  QS_VAR_DEFAULT_SEPARATOR
} from './const'
import {
  getVarsInPath,
  isHttpVerb,
  isNumeric,
  isStateVariable
} from './utils'
import { getContentWithReplacedForLoopsSyntax } from './forLoopHelpers'
import { getContentWithReplacedFakerVars } from './fakerHelpers'

// I N T E R F A C E S
export interface Route {
  route: string
  normalizedRoute: string
  routeVars: string[]
  filename: string
  fileContent: string
  method: HttpVerb
  statusCode: number
  stateVariable?: string
  isExtended: boolean
  header?: {[key: string]: string | number}
  body?: JsonRouteFileContent
  getBody: (vars: {[key: string]: string},
    queryStringVars?: {[key: string]: string}
  ) => JsonRouteFileContent | undefined
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
export interface QueryStringVarData {
  variable: string
  defaultValue?: string
}

export const getQueryStringVarSyntax = (data: QueryStringVarData): string => {
  const { variable, defaultValue } = data

  if (defaultValue) return `[q:${variable}|${defaultValue}]`
  return `[q:${variable}]`
}

export const getFilenameFromFilePath = (filePath: string): string => {
  filePath = filePath.replace(/\\/g, '/')
  const [filename] = filePath.split('/').slice(-1)

  return filename
}

export const getRouteFromFilePath = (filePath: string): string => {
  filePath = filePath.replace(/\\/g, '/')
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

export const getStateVariableInFilename = (filename: string): string | undefined => {
  let stateVariable: string | undefined
  const explodedFilename = filename.split('.')

  explodedFilename.forEach(filenameElement => {
    const isStateVar = filenameElement.startsWith('{') && filenameElement.endsWith('}')

    if (isStateVar) {
      stateVariable = filenameElement.slice(1, -1)
    }
  })

  return stateVariable
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

export const getQueryStringVarData = (queryStringSyntax: string): QueryStringVarData => {
  const [variable, defaultValue] = queryStringSyntax.split(QS_VAR_DEFAULT_SEPARATOR)
  return {
    variable: variable,
    defaultValue
  }
}

export const getQueryStringVarsInContent = (content: string): QueryStringVarData[] => {
  // In string `[q:startIndex|0], [q:size]` it will find `['startIndex|0', 'size']`
  const matchingVars = Array.from(content.matchAll(QUERY_STRING_VAR_MATCHER), m => m[1])

  return matchingVars.map((variable) => {
    return getQueryStringVarData(variable)
  })
}

export const getContentWithReplacedVars = (
  content: string,
  vars: {[key: string]: string},
  queryStringVars?: {[key: string]: string}
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
    // replace casted variables
    content = replaceAllCastedVar(content, variable, vars[variable])
    // replace simple variables
    content = replaceAll(content, `[${variable}]`, vars[variable])
  })

  if (queryStringVars) {
    const queryStringVarsInContent = getQueryStringVarsInContent(content)
    queryStringVarsInContent.forEach(({ variable, defaultValue }) => {
      const replaceValue = queryStringVars[variable] || defaultValue

      // if there is no query string in request and no default value for it
      // don't replace anything
      if (replaceValue) {
        content = replaceAll(
          content,
          getQueryStringVarSyntax({ variable, defaultValue }),
          replaceValue
        )
      }
    })
  }

  // unsanitize variables to escape
  content = getContentWithUnsanitizedEscapedVars(content)

  return content
}

export const isStructureExtended = (jsonContent: {[key: string]: any}): boolean => {
  return jsonContent[HEADER_SYNTAX] !== undefined || jsonContent[BODY_SYNTAX] !== undefined
}

export const isBodyEmpty = (body: JsonRouteFileContent): boolean => {
  const stringifiedEmptyBodySyntax = JSON.stringify(EMPTY_BODY_SYNTAX)

  if (JSON.stringify(body) === stringifiedEmptyBodySyntax) return true

  if (body[BODY_SYNTAX]) {
    return JSON.stringify(body[BODY_SYNTAX]) === stringifiedEmptyBodySyntax
      || body[BODY_SYNTAX] === stringifiedEmptyBodySyntax
  }

  return false
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
  const stateVariable = getStateVariableInFilename(filename)
  const statusCode = getResponseStatusCodeInFilename(filename)
  const method = getHttpMethodInFilename(filename)

  const isExtended = isStructureExtended(jsonContent)

  const header = jsonContent[HEADER_SYNTAX]

  const getBodyValue = (): JsonRouteFileContent | undefined => {
    if (isBodyEmpty(jsonContent)) return undefined

    return isExtended
      ? jsonContent[BODY_SYNTAX]
      : jsonContent
  }

  const body = getBodyValue()

  const getBody = (
    varsToReplace?: {[key: string]: string},
    queryStringVarsToReplace?: {[key: string]: string}
  ): JsonRouteFileContent | undefined => {
    if (body) {
      let bodyAsString = JSON.stringify(body)

      if (varsToReplace) {
        bodyAsString = getContentWithReplacedVars(
          bodyAsString,
          varsToReplace,
          queryStringVarsToReplace
        )
      }
      bodyAsString = getContentWithReplacedForLoopsSyntax(bodyAsString)
      bodyAsString = getContentWithReplacedFakerVars(bodyAsString)

      return JSON.parse(bodyAsString)
    }

    return undefined
  }

  return {
    route,
    routeVars,
    normalizedRoute,
    isExtended,
    filename,
    fileContent,
    stateVariable,
    statusCode,
    method,
    body,
    header,
    getBody
  }
}
