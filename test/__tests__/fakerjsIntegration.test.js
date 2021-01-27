import { getFakerVarsInContent } from '../../src/getRoute'

describe('Faker\'s integration', () => {
  it('should find faker\' syntax in content', () => {
    const content = '{"description": [faker:lorem:sentences], "name": [faker:name:findName]}'
    const expectedResult = ['lorem:sentences', 'name:findName']

    expect(getFakerVarsInContent(content)).toStrictEqual(expectedResult)
  })
})