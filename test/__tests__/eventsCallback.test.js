import * as path from 'path'
import * as fs from 'fs'

import 'isomorphic-fetch'

import Restapify from '../../src/Restapify'
import { OPEN_DASHBOARD_TIMEOUT } from '../../src/const'

jest.mock('open')

const apiRootDir = path.resolve(__dirname, '../api')
const restapifyParams = {
  rootDir: apiRootDir
}

const onStartSpy = jest.fn()
const onServerRestartSpy = jest.fn()
const onServerStartSpy = jest.fn()
const onDashboardOpenSpy = jest.fn()
const onErrorSpy = jest.fn()

const sleep = m => new Promise(r => setTimeout(r, m))

describe('Restapify\'s events', () => {
  afterEach(() => {
    onStartSpy.mockClear()
    onServerRestartSpy.mockClear()
    onServerStartSpy.mockClear()
    onDashboardOpenSpy.mockClear()
    onErrorSpy.mockClear()
  })

  describe('start', () => {
    it('should execute callback', () => {
      const RestapifyInstance = new Restapify({...restapifyParams})

      RestapifyInstance.on('start', onStartSpy)

      RestapifyInstance.on('start', () => {
        RestapifyInstance.close()
      })

      RestapifyInstance.run()

      expect(onStartSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('server:start', () => {
    it('should execute callback', () => {
      const RestapifyInstance = new Restapify({...restapifyParams})

      RestapifyInstance.on('server:start', onServerStartSpy)

      RestapifyInstance.on('start', () => {
        RestapifyInstance.close()
      })

      RestapifyInstance.run()

      expect(onServerStartSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('dashboard:open', () => {
    it('should execute callback', async () => {
      const RestapifyInstance = new Restapify({...restapifyParams, openDashboard: true})

      RestapifyInstance.on('dashboard:open', onDashboardOpenSpy)

      RestapifyInstance.on('start', () => {
        RestapifyInstance.close()
      })

      RestapifyInstance.run()

      await sleep(OPEN_DASHBOARD_TIMEOUT)

      expect(onDashboardOpenSpy).toHaveBeenCalledTimes(1)
    })

    it('shouldn\'t execute callback', async () => {
      const RestapifyInstance = new Restapify({...restapifyParams})

      RestapifyInstance.on('dashboard:open', onDashboardOpenSpy)

      RestapifyInstance.on('start', () => {
        RestapifyInstance.close()
      })

      RestapifyInstance.run()

      await sleep(OPEN_DASHBOARD_TIMEOUT)

      expect(onDashboardOpenSpy).not.toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('shouldn\'t execute callback', () => {
      const RestapifyInstance = new Restapify({...restapifyParams})

      RestapifyInstance.on('error', onErrorSpy)

      RestapifyInstance.on('start', () => {
        RestapifyInstance.close()
      })

      RestapifyInstance.run()

      expect(onErrorSpy).not.toHaveBeenCalled()
    })    
    
    it('should execute callback', () => {
      const filename = 'foobar.json'
      const filePath = path.resolve(apiRootDir, filename)

      fs.writeFileSync(filePath, 'invalid json')

      const RestapifyInstance = new Restapify({...restapifyParams})

      RestapifyInstance.on('error', onErrorSpy)

      RestapifyInstance.run()

      fs.unlinkSync(filePath)

      expect(onErrorSpy).toHaveBeenCalledTimes(1)
    })
  })
})
