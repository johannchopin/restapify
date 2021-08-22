import { RestapifyErrorName } from './types/restapify'
import {
  BOOLEAN_CAST_INDICATOR, CASTING_OPERATORS, NUMBER_CAST_INDICATOR
} from './const'
import { isNumeric, replaceAll } from './utils'

export const getVarCastSyntax = (variable: string, type: 'number' | 'boolean'):string => {
  const typeCastIndicator = {
    number: NUMBER_CAST_INDICATOR,
    boolean: BOOLEAN_CAST_INDICATOR
  }
  return `"${typeCastIndicator[type]}[${variable}]"`
}

export const getAllCastedVarsInContent = (content: string, variable: string): string[] => {
  const vars: string[] = []

  CASTING_OPERATORS.forEach((operator) => {
    const varCastSyntax = getVarCastSyntax(variable, operator)
    const isVarInContent = content.includes(varCastSyntax)

    if (isVarInContent) vars.push(varCastSyntax)
  })

  return vars
}

export const replaceAllCastedVar = (content: string, variable: string, value: string): string => {
  const castedVars = getAllCastedVarsInContent(content, variable)

  castedVars.forEach(castedVar => {
    if (castedVar.startsWith('"n:') && !isNumeric(value)) {
      const error: RestapifyErrorName = 'ERR'
      const errorObject = {
        error,
        message: `Error: \`${value}\` is not a valid number. Impossible to cast it for \`${castedVar}\``
      }
      throw new Error(JSON.stringify(errorObject))
    } else if (castedVar.startsWith('"b:') && value !== 'true' && value !== 'false') {
      const error: RestapifyErrorName = 'ERR'
      const errorObject = {
        error,
        message: `Error: \`${value}\` is not a valid boolean. Impossible to cast it for \`${castedVar}\``
      }
      throw new Error(JSON.stringify(errorObject))
    } else {
      content = replaceAll(content, castedVar, value)
    }
  })

  return content
}
