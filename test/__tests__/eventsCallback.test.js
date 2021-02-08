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
const onMultipleEventsSpy = jest.fn()

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
      const rpfy = new Restapify({...restapifyParams})

      rpfy.on('start', onStartSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      expect(onStartSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('server:start', () => {
    it('should execute callback', () => {
      const rpfy = new Restapify({...restapifyParams})

      rpfy.on('server:start', onServerStartSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      expect(onServerStartSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('dashboard:open', () => {
    it('should execute callback', async () => {
      const rpfy = new Restapify({...restapifyParams, openDashboard: true})

      rpfy.on('dashboard:open', onDashboardOpenSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      await sleep(OPEN_DASHBOARD_TIMEOUT)

      expect(onDashboardOpenSpy).toHaveBeenCalledTimes(1)
    })

    it('shouldn\'t execute callback', async () => {
      const rpfy = new Restapify({...restapifyParams})

      rpfy.on('dashboard:open', onDashboardOpenSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      await sleep(OPEN_DASHBOARD_TIMEOUT)

      expect(onDashboardOpenSpy).not.toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('shouldn\'t execute callback if no error', () => {
      const rpfy = new Restapify({...restapifyParams})

      rpfy.on('error', onErrorSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      expect(onErrorSpy).not.toHaveBeenCalled()
    })
    
    it('should execute callback for invalid JSON', () => {
      const filename = 'foobar.json'
      const filePath = path.resolve(apiRootDir, filename)

      fs.writeFileSync(filePath, 'invalid json')

      const rpfy = new Restapify({...restapifyParams})

      rpfy.on('error', onErrorSpy)

      rpfy.run()

      fs.unlinkSync(filePath)

      expect(onErrorSpy).toHaveBeenCalledTimes(1)
      expect(onErrorSpy).toHaveBeenCalledWith({
        error: 'INV:JSON_FILE',
        message: `Invalid json file ${filePath}: Unexpected token i in JSON at position 0`
      })
    })

    it('should execute callback for invalid base URL', () => {
      const rpfy = new Restapify({...restapifyParams, baseUrl: '/restapify'})

      rpfy.on('error', onErrorSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      expect(onErrorSpy).toHaveBeenCalledTimes(1)
      expect(onErrorSpy).toHaveBeenCalledWith({
        error: 'INV:API_BASEURL'
      })
    })

    it('should execute callback for missing root directory', () => {
      const rpfy = new Restapify({ rootDir: 'missingDirectory'})

      rpfy.on('error', onErrorSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      expect(onErrorSpy).toHaveBeenCalledTimes(1)
      expect(onErrorSpy).toHaveBeenCalledWith({
        error: 'MISS:ROOT_DIR'
      })
    })

    it('should execute callback for invalid fakerjs syntax', () => {
      const filename = 'foobar.json'
      const filePath = path.resolve(apiRootDir, filename)
      const bodyWithInvalidFakerjsSyntax = {
        email: "[#faker:internet:emailFoobar]",
      }
      fs.writeFileSync(filePath, JSON.stringify(bodyWithInvalidFakerjsSyntax))

      const rpfy = new Restapify({ ...restapifyParams })

      rpfy.on('error', onErrorSpy)

      rpfy.on('start', () => {
        rpfy.close()
      })

      rpfy.run()

      fs.unlinkSync(filePath)

      expect(onErrorSpy).toHaveBeenCalledTimes(1)
      expect(onErrorSpy).toHaveBeenCalledWith({
        error: 'INV:FAKER_SYNTAX'
      })
    })
  })

  it('should execute callback for multiple events', () => {
    const rpfy = new Restapify({...restapifyParams})

    rpfy.on(['server:start', 'start'], onMultipleEventsSpy)

    rpfy.on('start', () => {
      rpfy.close()
    })

    rpfy.run()

    expect(onMultipleEventsSpy).toHaveBeenCalledTimes(2)
  })
})
