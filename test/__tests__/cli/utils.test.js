import { getInstanceOverviewOutput, onRestapifyInstanceError } from '../../../src/cli/utils'

const consoleLogSpy = jest.spyOn(global.console, 'log')

describe('CLI utils functions', () => {
  afterEach(() => {
    consoleLogSpy.mockClear()
  })

  it('should output overview', () => {
    const port = 6767
    const baseUrl = 'dev'
    const output = getInstanceOverviewOutput(port, baseUrl)

    expect(output).toMatchSnapshot()
  })

  describe('Output the right error message', () => {
    const rpfyInstanceData = {
      rootDir: '/user/mockedApi/',
      port: 6767,
      apiBaseUrl: '/dev'
    }

    it('should output for missing rootDir', () => {
        const error = 'MISS:ROOT_DIR'
        onRestapifyInstanceError(error, rpfyInstanceData)

        expect(consoleLogSpy.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should output for missing port', () => {
        const error = 'MISS:PORT'
        onRestapifyInstanceError(error, rpfyInstanceData)

        expect(consoleLogSpy.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should output for invalid base URL', () => {
        const error = 'INV:API_BASEURL'
        onRestapifyInstanceError(error, rpfyInstanceData)

        expect(consoleLogSpy.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should output for invalid JSON file', () => {
        const error = 'INV:JSON_FILE'
        onRestapifyInstanceError(error, rpfyInstanceData)

        expect(consoleLogSpy.mock.calls[0][0]).toMatchSnapshot()
    })
  })
})