import * as path from 'path'

import {getRoute, getFakerVarsInContent } from '../../src/getRoute'

// D A T A
import getPostsById from '../api/posts/[postid]/*.json'

describe('Faker\'s integration', () => {
  it('should find faker\'s syntax in content', () => {
    const content = '{"description": "[#faker:lorem:sentences]", "name": "[#faker:name:findName]"}'
    const expectedResult = ['lorem:sentences', 'name:findName']

    expect(getFakerVarsInContent(content)).toStrictEqual(expectedResult)
  })

  it('should replace faker syntax by faker\'s data', () => {
    const EMAIL_MATCHER = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    const route = getRoute(
      path.resolve(__dirname, '../api/posts/[postid]/*.json'),
      path.resolve(__dirname, '../api'),
      JSON.stringify(getPostsById)
    )

    const bodyResponse = JSON.parse(route.getBody({postid: 'my-post'}))

    expect(bodyResponse.email).toMatch(EMAIL_MATCHER)
  })

  it('should replace faker syntax with number cast syntax', () => {
    const content = '{"timestamp": "n:[#faker:time:recent]"}'
    const result = getFakerVarsInContent(content)
    const isFakerValueNumber = !isNaN(result.timestamp)

    expect(isFakerValueNumber).toBeTruthy()
  })
})