import * as path from 'path'
import * as faker from 'faker';

import { getRoute } from '../../src/getRoute'
import { getFakerVarsInContent, getContentWithReplacedFakerVars } from '../../src/fakerHelpers'

// D A T A
import getPostsById from '../api/posts/[postid]/*.json'

jest.mock('faker', () => ({
  lorem: {
    text: jest.fn().mockImplementation(() => 'fake' ),
  },
  internet: {
    email: jest.fn().mockImplementation(() => 'fake@email.com' ),
  },
  time: {
    recent:jest.fn().mockImplementation(() => 123 ),
  }
}))

describe('Faker\'s integration', () => {
  it('should find faker\'s syntax in content', () => {
    const content = '{"description": "[#faker:lorem:sentences]", "name": "[#faker:name:findName]"}'
    const expectedResult = ['lorem:sentences', 'name:findName']

    expect(getFakerVarsInContent(content)).toStrictEqual(expectedResult)
  })

  it('should replace faker syntax by faker\'s data', () => {
    const route = getRoute(
      path.resolve(__dirname, '../api/posts/[postid]/*.json'),
      path.resolve(__dirname, '../api'),
      JSON.stringify(getPostsById)
    )
  
    route.getBody({postid: 'my-post'})

    expect(faker.lorem.text).toHaveBeenCalledTimes(1)
    expect(faker.internet.email).toHaveBeenCalledTimes(1)
    expect(faker.time.recent).toHaveBeenCalledTimes(1)
  })

  it('should replace faker syntax with number cast syntax', () => {
    const content = '{"timestamp": "n:[#faker:time:recent]"}'
    const result = JSON.parse(getContentWithReplacedFakerVars(content))
    const isFakerValueNumber = !isNaN(result.timestamp)

    expect(isFakerValueNumber).toBeTruthy()
  })
})