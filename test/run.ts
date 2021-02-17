/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path'
import Restapify from '../src/Restapify'

const rpfy = new Restapify({
  rootDir: path.resolve(__dirname, './api'),
  states: [
    {
      route: '/users/[userid]',
      state: 'ERR',
      method: 'DELETE'
    }
  ]
})

rpfy.onError(({ error }) => {
  console.log(`Ouuups> ${error}`)
})

rpfy.on('server:start', () => {
  console.log('server start')
})

rpfy.on('server:restart', () => {
  console.log('server restart')
})

rpfy.run()
