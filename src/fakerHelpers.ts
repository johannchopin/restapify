import faker from 'faker'
import {
  FAKER_SYNTAX_MATCHER,
  FAKER_SYNTAX_PREFIX,
  FAKER_SYNTAX_SUFIX
} from './const'
import { getCastVarToNumberSyntax, replaceAll } from './utils'

export const getFakerVarsInContent = (content: string): string[] => {
  return Array.from(content.matchAll(FAKER_SYNTAX_MATCHER), m => m[1])
}

export const getContentWithReplacedFakerVars = (content: string): string => {
  const fakerVars = getFakerVarsInContent(content)

  fakerVars.forEach((fakerVar) => {
    const fakerVarSyntax = `${FAKER_SYNTAX_PREFIX}${fakerVar}${FAKER_SYNTAX_SUFIX}`
    const [fakerNamespace, fakerMethod] = fakerVar.split(':')
    // @ts-ignore
    const fakedData = faker[fakerNamespace][fakerMethod]()
    const sanitizedFakedData = JSON.stringify(fakedData)
    const fakedDataValue = sanitizedFakedData.substring(1, sanitizedFakedData.length - 1)

    content = replaceAll(
      content,
      getCastVarToNumberSyntax(fakerVarSyntax.substring(1, fakerVarSyntax.length - 1)),
      fakedDataValue
    )
    content = content.replace(
      fakerVarSyntax,
      fakedDataValue
    )
  })

  return content
}
