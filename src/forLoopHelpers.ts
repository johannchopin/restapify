import range from 'lodash.range'

import { replaceAll, replaceAllCastedVar } from './utils'
import {
  FOR_LOOP_SYNTAX_MATCHER,
  FOR_LOOP_SYNTAX_PREFIX,
  FOR_LOOP_SYNTAX_SUFFIX
} from './const'
import { getContentWithReplacedFakerVars } from './fakerHelpers'
import { RestapifyErrorName } from './types'

const ELMT_BETWEEN_PARENTHESES_MATCHER = /\(([^)]+)\)/g

// I N T E R F A C E S
/*
Object containing for loop syntax component like:
for x in sequence:
     statements
*/
export interface ForLoopSyntax {
  x: string
  sequence: string
  statement: string
}
export interface RangeFunctionParams {
  start: number
  end?: number
  step?: number
}

interface SequenceObject {
  [key: string]: string | number | boolean;
}

const isStatementObjectValid = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).every(key => {
    return typeof obj[key] === 'string' ||
      typeof obj[key] === 'number' ||
      typeof obj[key] === 'boolean'
  })
}

export const getForLoopSyntax = (forLoopObject: ForLoopSyntax): string => {
  const { x, sequence, statement } = forLoopObject
  return `"${FOR_LOOP_SYNTAX_PREFIX} ${x} in ${sequence}",${statement},"${FOR_LOOP_SYNTAX_SUFFIX}"`
}

export const getForLoopSyntaxInContent = (content: string): ForLoopSyntax[] | undefined => {
  const matches = [...content.matchAll(FOR_LOOP_SYNTAX_MATCHER)]

  if (matches.length <= 0) {
    return undefined
  }

  return matches.map(m => {
    return {
      x: m[1],
      sequence: m[2],
      statement: m[3]
    }
  })
}

export const getStringifiedRangeFunctionParams = (
  stringifiedRange: string
): RangeFunctionParams | null => {
  const paramsMatch = stringifiedRange.match(ELMT_BETWEEN_PARENTHESES_MATCHER)

  if (paramsMatch === null) return null

  const paramsMatchString = paramsMatch[0]

  const splitedParams = paramsMatchString.substring(1, paramsMatchString.length - 1).split(',')

  return {
    start: Number(splitedParams[0]),
    end: splitedParams[1] ? Number(splitedParams[1]) : undefined,
    step: splitedParams[2] ? Number(splitedParams[2]) : undefined
  }
}

export const getArrayFromRangeString = (stringifiedRange: string): number[] => {
  const rangeParams = getStringifiedRangeFunctionParams(stringifiedRange)

  if (rangeParams) {
    const { start, end, step } = rangeParams
    return range(start, end, step)
  }

  return []
}

// eslint-disable-next-line max-len
export const getSequenceArrayAsArray = (sequence: string): (number | string | boolean | SequenceObject)[] => {
  sequence = getContentWithReplacedFakerVars(sequence)
  sequence = replaceAll(sequence, '\'', '"')

  return JSON.parse(sequence)
}

export const getSequenceArray = (sequence: string): (number | string | boolean | SequenceObject)[] => {
  const isSequenceAnArray = sequence.startsWith('[') && sequence.endsWith(']')
  const isSequenceRange = sequence.startsWith('range(') && sequence.endsWith(')')

  if (isSequenceAnArray) {
    return getSequenceArrayAsArray(sequence)
  } if (isSequenceRange) {
    return getArrayFromRangeString(sequence)
  }

  return []
}

export const getForLoopSyntaxResult = (forLoopSyntax: ForLoopSyntax): string => {
  const sequenceArray = getSequenceArray(forLoopSyntax.sequence)
  let resultArray: string[] = []

  sequenceArray.forEach(i => {
    let forLoopResult = forLoopSyntax.statement

    if (typeof i === 'object') {
      const isStatementValid = isStatementObjectValid(i)
      if (!isStatementValid) {
        const error: RestapifyErrorName = 'INV:SYNTAX'
        const errorObject = {
          error,
          message: `The object syntax ${JSON.stringify(i)} is not valid! Please refer to the documentation https://restapify.vercel.app/docs#for-loops-array-sequence`
        }
        throw new Error(JSON.stringify(errorObject))
      } else {
        Object.keys(i).forEach(key => {
          forLoopResult = replaceAllCastedVar(
            forLoopResult,
            `${forLoopSyntax.x}.${key}`,
            i[key].toString()
          )
  
          forLoopResult = replaceAll(forLoopResult, `[${forLoopSyntax.x}.${key}]`, (i as SequenceObject)[key].toString())
        })
      }
    } else {
      forLoopResult = replaceAllCastedVar(
        forLoopResult,
        forLoopSyntax.x,
        i.toString()
      )

      forLoopResult = replaceAll(forLoopResult, `[${forLoopSyntax.x}]`, i.toString())
    }
    resultArray.push(forLoopResult)
  })

  return resultArray.join(',')
}

export const getContentWithReplacedForLoopsSyntax = (content: string): string => {
  const forLoops = getForLoopSyntaxInContent(content)

  if (!forLoops) {
    return content
  }

  forLoops.forEach((forLoop) => {
    const forLoopSyntax = getForLoopSyntax(forLoop)
    content = content.replace(forLoopSyntax, getForLoopSyntaxResult(forLoop))
  })

  return getContentWithReplacedForLoopsSyntax(content)
}
