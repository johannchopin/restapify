import { getInstanceOverviewOutput } from '../../../src/cli/utils'

describe('CLI utils functions', () => {
  it('should output overview', () => {
    const port = 6767
    const baseUrl = 'dev'
    const output = getInstanceOverviewOutput(port, baseUrl)

    expect(output).toMatchSnapshot()
  })
})