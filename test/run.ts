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

RestapifyInstance.onError(({ error }) => {
  console.log(`Ouuups> ${error}`)
})

RestapifyInstance.on('server:start', () => {
  console.log('server start')
})

RestapifyInstance.on('server:restart', () => {
  console.log('server restart')
})

RestapifyInstance.run()
