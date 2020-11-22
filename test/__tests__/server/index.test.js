/* eslint-disable no-shadow */
import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../../src/server/index'

// D A T A
import getAnimals from '../../api/animals.json'
import getAnimalsByName from '../../api/animals/[name].json'
import getAnimalsByNameFriends from '../../api/animals/[name]/friends/[friend_id].json'
import getPlants from '../../api/plants.GET.json'
import getUsers from '../../api/users/*.json'
import postUsers from '../../api/users/*.POST.201.json'
import getComments from '../../api/comments/*.GET.json'
import deleteUser from '../../api/users/[userid].DELETE.json'
import deleteUserErr from '../../api/users/[userid].DELETE.400.{ERR}.json'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../../api'),
  port: 6767,
  apiPrefix: '/api'
}

const apiRoot = `http://localhost:${restapifyParams.port}${restapifyParams.apiPrefix}`

describe('Restapify', () => {
  let RestapifyInstance

  beforeEach(() => {
    RestapifyInstance = new Restapify(restapifyParams)
  })

  afterEach(() => {
    RestapifyInstance.close()
  })

  describe('HTTP verbs', () => {
    describe('GET', () => {
      it('should respond to get', async () => {
        let response = await fetch(`${apiRoot}/plants`)
        let data = await response.json()
        expect(data).toStrictEqual(getPlants)
      })

      it('should respond to default get', async () => {
        let response = await fetch(`${apiRoot}/animals`)
        let data = await response.json()
        expect(data).toStrictEqual(getAnimals)
      })

      it('should respond with star notation for default get', async () => {
        let response = await fetch(`${apiRoot}/users`)
        let data = await response.json()
        expect(data).toStrictEqual(getUsers)
      })

      it('should respond with star notation and get http verb', async () => {
        let response = await fetch(`${apiRoot}/comments`)
        let data = await response.json()
        expect(data).toStrictEqual(getComments)
      })
    })
  })

  describe('Star notation', () => {
    it('should respond to a GET with star notation and get http verb', async () => {
      let response = await fetch(`${apiRoot}/comments`)
      let data = await response.json()
      expect(data).toStrictEqual(getComments)
    })
  })

  describe('Route Variables', () => {
    it('should respond with injected variable', async () => {
      const variable = 'toby'
      const expectedResponse = { ...getAnimalsByName, name: variable }
      let response = await fetch(`${apiRoot}/animals/${variable}`)
      let data = await response.json()
      expect(data).toStrictEqual(expectedResponse)
    })

    it('should respond with injected variable in nested route', async () => {
      const animalName = 'toby'
      const friendId = '123'
      const expectedResponse = {
        ...getAnimalsByNameFriends,
        id: friendId,
        friends: [
          {
            ...getAnimalsByNameFriends.friends[0],
            name: animalName
          }
        ]
      }
      let response = await fetch(`${apiRoot}/animals/${animalName}/friends/${friendId}`)
      let data = await response.json()
      expect(data).toStrictEqual(expectedResponse)
    })
  })

  describe('Extended mock', () => {
    it('should respond with __body', async () => {
      let response = await fetch(`${apiRoot}/users/`, {
        method: 'POST'
      })
      let data = await response.json()
      expect(data).toStrictEqual(postUsers.__body)
    })
  })

  it('should respond with custom __header', async () => {
    let response = await fetch(`${apiRoot}/users/`, {
      method: 'POST'
    })

    let headers = response.headers

    Object.keys(postUsers.__header).forEach(headerProperty => {
      expect(headers.get(headerProperty)).toBe(postUsers.__header[headerProperty])
    })
  })

  it('should respond with defined HTTP Status Code', async () => {
    const expectedStatusCode = 201
    let response = await fetch(`${apiRoot}/users/`, {
      method: 'POST'
    })

    let statusCode = response.status

    expect(statusCode).toBe(expectedStatusCode)
  })

  describe('State variables', () => {
    let RestapifyInstance
    const states = [
      {
        route: '/users/[userid]',
        state: 'ERR',
        method: 'DELETE'
      }
    ]

    beforeEach(() => {
      RestapifyInstance = new Restapify({
        ...restapifyParams,
        states
      })
    })

    afterEach(() => {
      RestapifyInstance.close()
    })

    it('should respond according to state variable', async () => {
      let response = await fetch(`${apiRoot}/users/123`, {
        method: 'DELETE'
      })

      let statusCode = response.status
      let data = await response.json()

      expect(data).toStrictEqual(deleteUserErr.__body)
      expect(statusCode).toBe(400)
    })

    describe('Name of the group', () => {
      it('should update state variable', async () => {
        const updatedState = {
          route: '/users/[userid]',
          state: 'TEST',
          method: 'DELETE'
        }
        const expectedStates = [updatedState]
        RestapifyInstance.setState(updatedState)

        expect(RestapifyInstance.states).toStrictEqual(expectedStates)
      })

      it('should add state variable', async () => {
        const newState = {
          route: '/users/[userid]/comments',
          state: 'ERR',
          method: 'POST'
        }
        const expectedStates = [...states, newState]
        RestapifyInstance.setState(newState)

        expect(RestapifyInstance.states).toStrictEqual(expectedStates)
      })

      it('should remove state variable', async () => {
        const updatedState = {
          route: '/users/[userid]',
          method: 'DELETE'
        }
        const expectedStates = []
        RestapifyInstance.setState(updatedState)

        expect(RestapifyInstance.states).toStrictEqual(expectedStates)
      })

      it('should update state variable and respond with new data', async () => {
        RestapifyInstance.setState({
          route: '/users/[userid]',
          method: 'DELETE'
        })

        let response = await fetch(`${apiRoot}/users/123`, {
          method: 'DELETE'
        })

        let statusCode = response.status
        let data = await response.json()

        expect(data).toStrictEqual(deleteUser.__body)
        expect(statusCode).toBe(200)
      })
    })
  })
})
