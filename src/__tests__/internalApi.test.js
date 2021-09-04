/* eslint-disable no-shadow */
import * as path from 'path'
import * as fs from 'fs'
import 'isomorphic-fetch'
import Restapify from '../../src/Restapify'
import { normalizeNewline } from '../../test/utils'
import { LOCALES } from '../faker'

const ROOT_DIR = path.resolve(__dirname, '../../test/api')
const DEFAULT_LOCAL = 'en'

const restapifyParams = {
  rootDir: ROOT_DIR,
  port: 6767,
  baseUrl: '/api',
  hotWatch: false,
  locale: DEFAULT_LOCAL
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

  describe('locales', () => {
    it('should fetch current locale', async () => {
      const expectedResponseStatus = 200
      const expectedResponse = {locale: 'en'}

      let response = await fetch(`${apiEntryPoint}/configs/locale`)
      let data = await response.json()

      expect(response.status).toStrictEqual(expectedResponseStatus)
      expect(data).toStrictEqual(expectedResponse)
    })

    it('should fetch all the locales', async () => {
      const expectedResponseStatus = 200
      const expectedResponse = LOCALES

      let response = await fetch(`${apiEntryPoint}/configs/locales`)
      let data = await response.json()

      expect(response.status).toStrictEqual(expectedResponseStatus)
      expect(data).toStrictEqual(expectedResponse)
    })

    it('should update the locale', async () => {
      const expectedResponseStatus = 204

      const newLocal = 'fr'
      let response = await fetch(`${apiEntryPoint}/configs/locales`, {
        method: 'PUT',
        body: JSON.stringify({ locale: newLocal }),
        headers:{
          "Content-Type": "application/json"
        }
      })

      expect(response.status).toStrictEqual(expectedResponseStatus)
      expect(rpfy.locale).toBe(newLocal)
    })

    it('should fail on invalid local update', async () => {
      const expectedResponseStatus = 400

      const invalidLocal = 'foobar'
      let response = await fetch(`${apiEntryPoint}/configs/locales`, {
        method: 'PUT',
        body: JSON.stringify({ locale: invalidLocal }),
        headers:{
          "Content-Type": "application/json"
        }
      })

      const errorMessage = await response.text()

      expect(response.status).toStrictEqual(expectedResponseStatus)
      expect(errorMessage).toBe(`The given locale ${invalidLocal} is not valid! Please refer to the documentation https://github.com/Marak/faker.js#localization`)
      expect(rpfy.locale).toBe(DEFAULT_LOCAL)
    })
  })
})
