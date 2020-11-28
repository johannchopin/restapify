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
})
