import * as path from 'path'
import * as faker from 'faker';

import { getRoute } from '../../src/getRoute'
import { getFakerVarsInContent, getContentWithReplacedFakerVars, areFakerVarsSyntaxValidInContent } from '../../src/fakerHelpers'

// D A T A
import getPostsById from '../api/posts/[postid]/_.json'

jest.mock('faker', () => ({
  lorem: {
    text: jest.fn().mockImplementation(() => 'fake' ),
  },
  internet: {
    email: jest.fn().mockImplementation(() => 'fake@email.com' ),
  },
  time: {
    recent: jest.fn().mockImplementation(() => 123 ),
  },
  random: {
    boolean: jest.fn().mockImplementation(() => true )
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
      path.resolve(__dirname, '../api/posts/[postid]/_.json'),
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

    expect(result.timestamp).toBe(123)
  })

  it('should replace faker syntax with boolean cast syntax', () => {
    const content = '{"boolean": "b:[#faker:random:boolean]"}'
    const result = JSON.parse(getContentWithReplacedFakerVars(content))

    expect(result.boolean).toBe(true)
  })

  describe('Invalid faker syntax detection', () => {
    it('should find invalid syntax', () => {
      const content = JSON.stringify({
        email: "[#faker:internetFoobar:emailFoobar]",
      })
      const expectedResult = {
        namespace: 'internetFoobar',
        method: 'emailFoobar'
      }

      expect(areFakerVarsSyntaxValidInContent(content)).toStrictEqual(expectedResult)
    })
    
    it('should find valid syntax', () => {
      const content = JSON.stringify({
        email: "[#faker:internet:email]",
      })

      expect(areFakerVarsSyntaxValidInContent(content)).toBeTruthy()
    })
    
    it('should find valid syntax when no faker variable', () => {
      const content = JSON.stringify({
        email: "foo@bar.com",
      })

      expect(areFakerVarsSyntaxValidInContent(content)).toBeTruthy()
    })
  })
})