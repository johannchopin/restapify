import * as path from 'path'
import * as fs from 'fs'

import { cli } from '../../cli'

const API_FOLDER_PATH = path.resolve(__dirname, '../../../../test/api')
const consoleLogSpy = jest.spyOn(global.console, 'log')

describe('Global test on the cli', () => {
  describe('Show correct error messages', () => {
    it('should show an error message for invalid faker syntax', () => {
      const invalidFakerSyntax = "[#faker:company:companyNameBla]"
      const invalidFilePath = path.resolve(API_FOLDER_PATH, './bla.json')

      fs.writeFileSync(invalidFilePath, `{ "name": "${invalidFakerSyntax}"}`)

      const args = `yarn restapify serve ${API_FOLDER_PATH}`
      cli(args.split(' '))

      fs.unlinkSync(invalidFilePath)

      const logOutput = consoleLogSpy.mock.calls[0][0]

      expect(logOutput).toEqual(
        expect.stringContaining((`The fakerjs method call \`faker.company.companyNameBla()\` is not valid! Please refer to the documentation https://restapify.vercel.app/docs#fakerjs-integration`))
      )
    })
  })
})