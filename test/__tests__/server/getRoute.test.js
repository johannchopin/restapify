import { getNormalizedRoute, getStateVarsInFilename } from '../../../src/server/getRoute'

describe('Get route helpers', () => {
  describe('getNormalizedRoute', () => {
    it('should return the same route', () => {
      const route = '/posts/67/comments'
      const expectedNormalizedRoute = route

      expect(getNormalizedRoute(route)).toBe(expectedNormalizedRoute)
    })

    it('should normalize variables in route', () => {
      const route = '/posts/[post_id]/comments/[comment_id]'
      const vars = ['post_id', 'comment_id']
      const expectedNormalizedRoute = '/posts/:post_id/comments/:comment_id'

      expect(getNormalizedRoute(route, vars)).toBe(expectedNormalizedRoute)
    })
  })

  describe('getStateVarsInFilename', () => {
    it('should not find any state variable', () => {
      const filename = '[id].POST.json'
      const expectedStateVars = []

      expect(getStateVarsInFilename(filename)).toStrictEqual(expectedStateVars)
    })

    it('should find one state variable', () => {
      const filename = '[id].POST.{INV_CRED}.json'
      const expectedStateVars = ['INV_CRED']

      expect(getStateVarsInFilename(filename)).toStrictEqual(expectedStateVars)
    })

    it('should find multiple state variables', () => {
      const filename = '[id].POST.{INV_CRED|ERR|INV_INPUT}.json'
      const expectedStateVars = ['INV_CRED', 'ERR', 'INV_INPUT']

      expect(getStateVarsInFilename(filename)).toStrictEqual(expectedStateVars)
    })
  })
})
