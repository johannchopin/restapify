import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../../src/server/index'

// D A T A
import getAnimals from '../../api/animals.json'
import getAnimalsByName from '../../api/animals/[name].json'
import getAnimalsByNameFriends from '../../api/animals/[name]/friends/[friend_id].json'
import getPlants from '../../api/plants.get.json'
import getUsers from '../../api/users/*.json'
import getComments from '../../api/comments/*.get.json'

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
})
