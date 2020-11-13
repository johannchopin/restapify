import * as path from 'path'
import 'isomorphic-fetch'
import Restapify from '../../src/server/index'

// D A T A
import users from '../api/users/*.json'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../api'),
  port: 6767,
  apiPrefix: '/api'
}

const apiRoot = `http://localhost:${restapifyParams.port}${restapifyParams.apiPrefix}`

describe('Restapify', () => {
  let RestapifyInstance

  beforeEach(() => {
    RestapifyInstance = new Restapify(restapifyParams)
  });

  afterEach(() => {
    RestapifyInstance.close()
  })

  describe('Running server', () => {
    it('should respond to a simple GET', async () => {
      let response = await fetch(`${apiRoot}/users`);
      let data = await response.json()
      expect(data).toStrictEqual(users)
    });
  });
});