/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path'
import Restapify from '../src/server/index'

const mockedApi = new Restapify({
  rootDir: path.resolve(__dirname, './api'),
  states: [
    {
      route: '/users/[userid]',
      state: 'ERR',
      method: 'DELETE'
    }
  ]
})
