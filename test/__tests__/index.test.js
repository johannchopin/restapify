import * as path from 'path'
import Restapify from '../../src/server/index'

const restapifyParams = {
  rootDir: path.resolve(__dirname, '../api'),
  port: 6767,
  apiPrefix: '/api'
}

const apiRoot = `http://localhost:${restapifyParams.port}${restapifyParams.apiPrefix}`

const RestapifyInstance = new Restapify(restapifyParams)
RestapifyInstance.run()

describe('Restapify', () => {
  describe('Running server', () => {
    it('should respond to a simple GET', async () => {
      let response = await fetch(`${apiRoot}/users`);
      let data = await response.json()
      console.log(data)
    });
  });
});