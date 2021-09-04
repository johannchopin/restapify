/* eslint-disable no-shadow */
import * as path from 'path'
import * as fs from 'fs'
import 'isomorphic-fetch'
import Restapify from '../../src/Restapify'
import { normalizeNewline } from '../../test/utils'

const ROOT_DIR = path.resolve(__dirname, '../../test/api')

const restapifyParams = {
  rootDir: ROOT_DIR,
  port: 6767,
  baseUrl: '/api',
  hotWatch: false
}

const baseUrl = `http://localhost:${restapifyParams.port}`
const apiEntryPoint = `${baseUrl}/restapify/api`

describe('Internal API', () => {
  let rpfy

  beforeEach(() => {
    rpfy = new Restapify(restapifyParams)
    rpfy.run()
  })

  afterEach(() => {
    rpfy.close()
  })

  it('should fetch /api', async () => {
    const expectedResponse = {
      port: restapifyParams.port,
      baseUrl: restapifyParams.baseUrl,
      routes: {
        "/users/[userid]": {
          "GET": {
            "states": {
              "ERR": {
                "fileContent": "{\n  \"success\": false,\n  \"test\": \"error\"\n}",
                "body": { success: false, test: "error" },
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
            "statusCode": 200,
            "method": "GET",
            "body": { testUserId: "n:[userid]" }
          },
          "DELETE": {
            "states": {
              "INV_CRED": {
                "fileContent": "[null]",
                "isExtended": false,
                "statusCode": 401
              },
              "ERR": {
                "body": { success: false },
                "fileContent": "{\n  \"#header\": {\n    \"Content-Type\": \"text/html; charset=UTF-8\"\n  },\n  \"#body\": {\n    \"success\": false\n  }\n}",
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
            "fileContent": "{\n  \"#header\": {\n    \"Content-Type\": \"text/html; charset=UTF-8\"\n  },\n  \"#body\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": 67,\n      \"name\": \"bob\"\n    }\n  }\n}",
            "statusCode": 200,
            "method": "DELETE",
            "body": { success: true, data: { id: 67, name: "bob" } },
            "header": {
              "Content-Type": "text/html; charset=UTF-8"
            }
          }
        }
      }
    }

    let response = await fetch(`${apiEntryPoint}/api`)
    let data = await response.json()
    expect(normalizeNewline(data)).toMatchObject(expectedResponse)
  })

  it('should update /api on file creation', async () => {
    const newRouteFilePath = path.resolve(ROOT_DIR, 'bla.json')
    const newRouteContent = {foor: 'bar'}
    const stringNewRouteContent = JSON.stringify(newRouteContent)

    fs.writeFileSync(newRouteFilePath, stringNewRouteContent)
    fs.appendFileSync(newRouteFilePath, '\n')

    let response = await fetch(`${apiEntryPoint}/api`)
    let data = await response.json()

    fs.unlinkSync(newRouteFilePath)

    expect(data['/bla']).toBe(undefined)
  })

  it('should fetch /states', async () => {
    const expectedResponse = rpfy.states
    let response = await fetch(`${apiEntryPoint}/states`)
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
      let response = await fetch(`${apiEntryPoint}/states`, {
        method: 'PUT',
        body: JSON.stringify(updatedStateObject),
        headers:{
          "Content-Type": "application/json"
        }
      })

      expect(response.status).toBe(expectedResponseStatus)
      expect(rpfy.states).toContainEqual(updatedStateObject)
    })

    it('should response with error on invalid body', async () => {
      const expectedResponseStatus = 401
      let response = await fetch(`${apiEntryPoint}/states`, {
        method: 'PUT'
      })

      expect(response.status).toBe(expectedResponseStatus)
    })
  })
})
