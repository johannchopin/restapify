/* eslint-disable no-shadow */
import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../src/Restapify'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../api'),
  port: 6767,
  baseURL: '/api',
  hotWatch: false
}

const baseUrl = `http://localhost:${restapifyParams.port}`
const apiRoot = `${baseUrl}/restapify/api`

describe('Internal API', () => {
  let RestapifyInstance

  beforeEach(() => {
    RestapifyInstance = new Restapify(restapifyParams)
    RestapifyInstance.run()
  })

  afterEach(() => {
    RestapifyInstance.close()
  })

  it('should fetch /routes', async () => {
    const expectedResponse = {
      "/users/[userid]": {
        "GET": {
          "states": {
            "ERR": {
              "body": "{\n  \"success\": false,\n  \"test\": \"error\"\n}",
              "fileContent": "{\n  \"success\": false,\n  \"test\": \"error\"\n}",
              "isExtended": false,
              "statusCode": 404
            }
          },
          "route": "/users/[userid]",
          "routeVars": [
            "userid"
          ],
          "normalizedRoute": "/users/:userid",
          "isExtended": false,
          "filename": "[userid].json",
          "fileContent": "{\n  \"testUserId\": \"n:[userid]\"\n}",
          "stateVars": [],
          "statusCode": 200,
          "method": "GET",
          "body": "{\n  \"testUserId\": \"n:[userid]\"\n}"
        },
        "DELETE": {
          "states": {
            "INV_CRED": {
              "fileContent": "[null]",
              "isExtended": false,
              "statusCode": 401
            },
            "INV_TOKEN": {
              "fileContent": "[null]",
              "isExtended": false,
              "statusCode": 401
            },
            "ERR": {
              "body": "{\"success\":false}",
              "fileContent": "{\n  \"__header\": {\n    \"Content-Type\": \"text/html; charset=UTF-8\"\n  },\n  \"__body\": {\n    \"success\": false\n  }\n}",
              "header": {
                "Content-Type": "text/html; charset=UTF-8"
              },
              "isExtended": true,
              "statusCode": 404
            }
          },
          "route": "/users/[userid]",
          "routeVars": [
            "userid"
          ],
          "normalizedRoute": "/users/:userid",
          "isExtended": true,
          "filename": "[userid].DELETE.json",
          "fileContent": "{\n  \"__header\": {\n    \"Content-Type\": \"text/html; charset=UTF-8\"\n  },\n  \"__body\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": 67,\n      \"name\": \"bob\"\n    }\n  }\n}",
          "stateVars": [],
          "statusCode": 200,
          "method": "DELETE",
          "body": "{\"success\":true,\"data\":{\"id\":67,\"name\":\"bob\"}}",
          "header": {
            "Content-Type": "text/html; charset=UTF-8"
          }
        }
      }
    }

    let response = await fetch(`${apiRoot}/routes`)
    let data = await response.json()
    expect(data).toMatchObject(expectedResponse)
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
