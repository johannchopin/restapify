import faker from 'faker'
import {
  FAKER_SYNTAX_MATCHER,
  FAKER_SYNTAX_PREFIX,
  FAKER_SYNTAX_SUFIX
} from './const'
import { FakerSyntaxData } from './types'
import { replaceAllCastedVar } from './utils'

export const getFakerVarsInContent = (content: string): string[] => {
  return Array.from(content.matchAll(FAKER_SYNTAX_MATCHER), m => m[1])
}

export const areFakerVarsSyntaxValidInContent = (content: string): true | FakerSyntaxData => {
  const fakerVars = getFakerVarsInContent(content)
  let invalidFakerSyntaxData: FakerSyntaxData | null = null

  fakerVars.some((fakerVar) => {
    const [fakerNamespace, fakerMethod] = fakerVar.split(':')
    // @ts-ignore
    const isFakerSyntaxValid = faker[fakerNamespace] !== undefined
      // @ts-ignore
      && faker[fakerNamespace][fakerMethod] !== undefined

    if (!isFakerSyntaxValid) {
      invalidFakerSyntaxData = {
        namespace: fakerNamespace,
        method: fakerMethod
      }
      return false
    }
    return true
  })

  return invalidFakerSyntaxData !== null ? invalidFakerSyntaxData : true
}

export const getFakerDataSyntax = (data: FakerSyntaxData): string => {
  const { namespace, method } = data
  return `${FAKER_SYNTAX_PREFIX}${namespace}:${method}${FAKER_SYNTAX_SUFIX}`
}

export const replaceAllCastedFakerVar = (
  content: string,
  variable: FakerSyntaxData,
  value: string
): string => {
  const fakerSyntax = getFakerDataSyntax(variable)
  return replaceAllCastedVar(content, fakerSyntax.substring(1, fakerSyntax.length - 1), value)
}

export const getContentWithReplacedFakerVars = (content: string): string => {
  const fakerVars = getFakerVarsInContent(content)

  fakerVars.forEach((fakerVar) => {
    const fakerVarSyntax = `${FAKER_SYNTAX_PREFIX}${fakerVar}${FAKER_SYNTAX_SUFIX}`
    const [namespace, method] = fakerVar.split(':')
    // @ts-ignore
    const fakedData = faker[namespace][method]()
    let sanitizedFakedData = JSON.stringify(fakedData)

    const isFakedDataString = sanitizedFakedData.startsWith('"') && sanitizedFakedData.endsWith('"')
    if (isFakedDataString) {
      sanitizedFakedData = sanitizedFakedData.substring(1, sanitizedFakedData.length - 1)
    }

    content = replaceAllCastedFakerVar(content, { namespace, method }, sanitizedFakedData)
    content = content.replace(
      fakerVarSyntax,
      sanitizedFakedData
    )
  })

  return content
}
