import * as path from 'path'

import { cli } from '../../cli'

const consoleLogSpy = jest.spyOn(global.console, 'log')

describe('Test `list` command', () => {
  describe('List routes', () => {
    const pathToApiFolder = path.resolve(__dirname, '../../../../test/api')
    const args = `yarn restapify list ${pathToApiFolder}`
    let logOutput

    beforeEach(() => {
      cli(args.split(' '))
      logOutput = consoleLogSpy.mock.calls[0][0]
    })

    it('should contain correct routes', () => {
      expect(logOutput).toEqual(
        expect.stringContaining('/api/animals')
      )
      expect(logOutput).toEqual(
        expect.stringContaining('/api/posts/[postid]/comments/[commentid]')
      )
      expect(logOutput).toEqual(
        expect.stringContaining('/api/users/[userid]/friends')
      )
    })

    it('should output correct number of routes', () => {
      expect(logOutput.split('\n').length).toBe(24)
    })
  })
})