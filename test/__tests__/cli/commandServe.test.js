import * as path from 'path'

import Restapify from '../../../src/Restapify'
import { cli } from '../../../src/cli/cli'

const runSpy = jest.fn()
const onSpy = jest.fn()
const onErrorSpy = jest.fn()
jest.mock('../../../src/Restapify')
Restapify.mockImplementation(() => {
  return {
    run: runSpy,
    on: onSpy,
    onError: onErrorSpy
  }
})

const pathToApiFolder = path.resolve(__dirname, '../../api')
console.log(pathToApiFolder)

describe('Test `serve` command', () => {
  beforeEach(() => {
    Restapify.mockClear();
  })

  it('should init Restapify\'s instance with default options', () => {
    const expectedOptionsInConstuctor = {
      rootDir: pathToApiFolder,
      openDashboard: true, 
      baseUrl: undefined, 
      port: undefined
    }
    const args = `yarn restapify serve ${pathToApiFolder}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should init Restapify\'s instance with custom options', () => {
    const CUSTOM_BASEURL = '/api/test'
    const CUSTOM_PORT = '0000'
    const expectedOptionsInConstuctor = {
      rootDir: pathToApiFolder,
      openDashboard: false, 
      baseUrl: CUSTOM_BASEURL, 
      port: CUSTOM_PORT
    }
    const args = `yarn restapify serve ${pathToApiFolder} --no-open --baseUrl ${CUSTOM_BASEURL} --port ${CUSTOM_PORT}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should init Restapify\'s instance with custom short options', () => {
    const CUSTOM_BASEURL = '/api/test'
    const CUSTOM_PORT = '42'
    const expectedOptionsInConstuctor = {
      rootDir: pathToApiFolder,
      openDashboard: true, 
      baseUrl: CUSTOM_BASEURL, 
      port: CUSTOM_PORT
    }
    const args = `yarn restapify serve ${pathToApiFolder} -o -b ${CUSTOM_BASEURL} -p ${CUSTOM_PORT}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })
})
