import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../src/Restapify'
import {
  getContentWithReplacedVars,
  getQueryStringVarsInContent
} from '../../src/getRoute'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../api'),
  port: 6767,
  baseURL: '/api',
  hotWatch: false
}

const baseUrl = `http://localhost:${restapifyParams.port}`
const apiRoot = `${baseUrl}${restapifyParams.baseURL}`

describe('Query strings integration', () => {
  it('should find query strings syntax in content', () => {
    const content = JSON.stringify({
      size: '[q:size|20]',
      limit: '[q:limit]'
    })
    const expectedResult = [{variable: 'size', defaultValue: '20'}, {variable: 'limit', 'defaultValue': undefined,}]
    expect(getQueryStringVarsInContent(content)).toStrictEqual(expectedResult)
  })

  it('should replace all query string variables in text content', () => {
    const content = JSON.stringify({
      size: '[q:size]',
      limit: '[q:limit]'
    })
    const vars = {
      size: '20',
      limit: '2'
    }
    const expectedContentWithReplacedVars = JSON.stringify({
      size: '20',
      limit: '2'
    })

    expect(getContentWithReplacedVars(content, [], vars))
      .toStrictEqual(expectedContentWithReplacedVars)
  })


  it('should use default query string variables value in text content', () => {
    const content = JSON.stringify({
      size: '[q:size]',
      limit: '[q:limit|42]'
    })
    const vars = {
      size: '20'
    }
    const expectedContentWithReplacedVars = JSON.stringify({
      size: '20',
      limit: '42'
    })

    expect(getContentWithReplacedVars(content, [], vars))
      .toStrictEqual(expectedContentWithReplacedVars)
  })

  it('should fetch route with query strings and get them in response body', async () => {
    const rpfy = new Restapify(restapifyParams)
    rpfy.run()
    const postsLimit = 17

    let response = await fetch(`${apiRoot}/posts?limit=${postsLimit}`)
    let data = await response.json()

    rpfy.close()
  
    expect(data.length).toBe(postsLimit)
  })
})