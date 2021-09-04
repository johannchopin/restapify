import * as path from 'path'

import Restapify from '../../../Restapify'
import { cli } from '../../cli'

const runSpy = jest.fn()
const onSpy = jest.fn()
const onErrorSpy = jest.fn()
jest.mock('../../../Restapify')
Restapify.mockImplementation(() => {
  return {
    run: runSpy,
    on: onSpy,
    onError: onErrorSpy
  }
})

const API_FOLDER_PATH = path.resolve(__dirname, '../../../../api')

const CUSTOM_BASEURL = '/api/test'
const CUSTOM_PORT = '0000'
const CUSTOM_LOCALE = 'fr'

describe('Test `serve` command', () => {
  beforeEach(() => {
    Restapify.mockClear();
  })

  it('should init Restapify\'s instance with default options', () => {
    const expectedOptionsInConstuctor = {
      rootDir: API_FOLDER_PATH,
      openDashboard: undefined, 
      baseUrl: undefined, 
      port: undefined,
      locale: undefined
    }
    const args = `yarn restapify serve ${API_FOLDER_PATH}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should init Restapify\'s instance with custom options', () => {
    const expectedOptionsInConstuctor = {
      rootDir: API_FOLDER_PATH,
      openDashboard: false, 
      baseUrl: CUSTOM_BASEURL, 
      port: CUSTOM_PORT,
      locale: CUSTOM_LOCALE
    }
    const args = `yarn restapify serve ${API_FOLDER_PATH} --no-open --baseUrl ${CUSTOM_BASEURL} --port ${CUSTOM_PORT} --locale ${CUSTOM_LOCALE}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should init Restapify\'s instance with custom short options', () => {
    const expectedOptionsInConstuctor = {
      rootDir: API_FOLDER_PATH,
      openDashboard: true, 
      baseUrl: CUSTOM_BASEURL, 
      port: CUSTOM_PORT,
      locale: CUSTOM_LOCALE
    }
    const args = `yarn restapify serve ${API_FOLDER_PATH} -o -b ${CUSTOM_BASEURL} -p ${CUSTOM_PORT} -l ${CUSTOM_LOCALE}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })
})
