/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path'
import Restapify from '../src/Restapify'

const RestapifyInstance = new Restapify({
  rootDir: path.resolve(__dirname, './api'),
  states: [
    {
      route: '/users/[userid]',
      state: 'ERR',
      method: 'DELETE'
    }
  ]
})

RestapifyInstance.on('error', ({ error }) => {
  console.log(error)
})

RestapifyInstance.run()
