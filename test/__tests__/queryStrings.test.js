import {
  getContentWithReplacedVars
} from '../../src/getRoute'

describe('Query strings integration', () => {
  it('should replace all query string variables in text content', () => {
    const content = JSON.stringify({
      size: '[q:size]',
      limit: '[q:limit]'
    })
    const vars = {
      size: '20',
      limit: '2'
    }
    const expectedContentWithReplacedVars = JSON.stringify({
      size: '20',
      limit: '2'
    })

    expect(getContentWithReplacedVars(content, [], vars))
      .toStrictEqual(expectedContentWithReplacedVars)
  })
})