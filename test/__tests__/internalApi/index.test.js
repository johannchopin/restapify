/* eslint-disable no-shadow */
import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../../src/server/index'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../../api'),
  port: 6767,
  baseURL: '/api'
}

const baseUrl = `http://localhost:${restapifyParams.port}`
const apiRoot = `${baseUrl}/restapify/api`

describe('Internal API', () => {
  let RestapifyInstance

  beforeEach(() => {
    RestapifyInstance = new Restapify(restapifyParams)
  })

  afterEach(() => {
    RestapifyInstance.close()
  })

  it('should fetch /routes', async () => {
    let expectedResponse = RestapifyInstance.routes
    Object.keys(expectedResponse).forEach(route => {
      Object.keys(expectedResponse[route]).forEach(method => {
        let {getBody, header, ...rest} = expectedResponse[route][method]

        if (header) {
          rest = {...rest, header}
        }

        expectedResponse[route][method] = rest
      })
    })

    let response = await fetch(`${apiRoot}/routes`)
    let data = await response.json()
    expect(data).toStrictEqual(expectedResponse)
  })

  it('should fetch /states', async () => {
    const expectedResponse = RestapifyInstance.states
    let response = await fetch(`${apiRoot}/states`)
    let data = await response.json()
    expect(data).toStrictEqual(expectedResponse)
  })

  describe('Update states', () => {
    it('should update states', async () => {
      const expectedResponseStatus = 204
      const updatedStateObject = {
        route: '/users/[userid]',
        state: 'ERR',
        method: 'POST'
      }
      let response = await fetch(`${apiRoot}/states`, {
        method: 'PUT',
        body: JSON.stringify(updatedStateObject),
        headers:{
          "Content-Type": "application/json"
        }
      })

      expect(response.status).toBe(expectedResponseStatus)
      expect(RestapifyInstance.states).toContainEqual(updatedStateObject)
    })

    it('should response with error on invalid body', async () => {
      const expectedResponseStatus = 401
      let response = await fetch(`${apiRoot}/states`, {
        method: 'PUT'
      })

      expect(response.status).toBe(expectedResponseStatus)
    })
  })
})
