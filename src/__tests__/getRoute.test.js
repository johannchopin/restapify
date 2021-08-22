import {
  getContentWithReplacedVars,
  getNormalizedRoute,
  getStateVariableInFilename,
  getFilenameFromFilePath,
  getRouteFromFilePath,
  getResponseStatusCodeInFilename,
  getHttpMethodInFilename,
  isBodyEmpty,
} from '../../src/getRoute'

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

  describe('getStateVariableInFilename', () => {
    it('should not find any state variable', () => {
      const filename = '[id].POST.json'

      expect(getStateVariableInFilename(filename)).toBe(undefined)
    })

    it('should find one state variable', () => {
      const filename = '[id].POST.{INV_CRED}.json'
      const expectedStateVariable = 'INV_CRED'

      expect(getStateVariableInFilename(filename)).toStrictEqual(expectedStateVariable)
    })
  })

  describe('getContentWithReplacedVars', () => {
    it('should replace all variables in text content', () => {
      const content = JSON.stringify({
        post: '[postid]',
        comment: '[commentid]'
      })
      const vars = {
        postid: 'just-a-post',
        commentid: 'just-a-comment'
      }
      const expectedContentWithReplacedVars = JSON.stringify({
        post: 'just-a-post',
        comment: 'just-a-comment'
      })

      expect(getContentWithReplacedVars(content, vars))
        .toStrictEqual(expectedContentWithReplacedVars)
    })

    it('should replace and cast number variables', () => {
      const content = JSON.stringify({
        post: '[postid]',
        comment: 'n:[commentid]'
      })
      const vars = {
        postid: 'just-a-post',
        commentid: '123'
      }
      const expectedContentWithReplacedVars = JSON.stringify({
        post: 'just-a-post',
        comment: 123
      })

      expect(getContentWithReplacedVars(content, vars))
        .toStrictEqual(expectedContentWithReplacedVars)
    })

    it('should replace and cast boolean variables', () => {
      const content = JSON.stringify({
        post: '[postid]',
        private: 'b:[publishStatus]'
      })
      const vars = {
        postid: 'just-a-post',
        publishStatus: 'true'
      }
      const expectedContentWithReplacedVars = JSON.stringify({
        post: 'just-a-post',
        private: true
      })

      expect(getContentWithReplacedVars(content, vars))
        .toStrictEqual(expectedContentWithReplacedVars)
    })

    it('should not replace escaped variables', () => {
      const content = JSON.stringify({
        post: '[postid]',
        comment: 'I like to write comments that contains `[commentid]`'
      })
      const vars = {
        postid: 'just-a-post',
        commentid: '123'
      }
      const expectedContentWithReplacedVars = JSON.stringify({
        post: 'just-a-post',
        comment: 'I like to write comments that contains [commentid]'
      })

      expect(getContentWithReplacedVars(content, vars))
        .toStrictEqual(expectedContentWithReplacedVars)
    })
  })

  describe('getFilenameFromFilePath', () => {
    const filePath = '/posts/[post_id]/comments/[comment_id].POST.{ERR}.json'
    const expectedFilename = '[comment_id].POST.{ERR}.json'

    expect(getFilenameFromFilePath(filePath)).toBe(expectedFilename)
  })

  describe('getRouteFromFilePath', () => {
    it('should return route with local route indicator', () => {
      const filePath = '/posts/[post_id]/comments/_.POST.{ERR}.json'
      const expectedRoute = '/posts/[post_id]/comments'

      expect(getRouteFromFilePath(filePath)).toBe(expectedRoute)
    })

    it('should return route with fixed value', () => {
      const filePath = '/posts/[post_id]/comments/45.POST.{ERR}.json'
      const expectedRoute = '/posts/[post_id]/comments/45'

      expect(getRouteFromFilePath(filePath)).toBe(expectedRoute)
    })

    it('should return route with variable notation', () => {
      const filePath = '/posts/[post_id]/comments/[commentid].POST.{ERR}.json'
      const expectedRoute = '/posts/[post_id]/comments/[commentid]'

      expect(getRouteFromFilePath(filePath)).toBe(expectedRoute)
    })
  })

  describe('getResponseStatusCodeInFilename', () => {
    it('should return default 200 as default status code', () => {
      const filename = '_.json'
      const expectedStatusCode = 200

      expect(getResponseStatusCodeInFilename(filename)).toBe(expectedStatusCode)
    })

    it('should return 200 as default status code with state variable and HTTP verb', () => {
      const filename = '_.POST.{ERR}.json'
      const expectedStatusCode = 200

      expect(getResponseStatusCodeInFilename(filename)).toBe(expectedStatusCode)
    })

    it('should return status code ', () => {
      const filename = '_.POST.204.json'
      const expectedStatusCode = 204

      expect(getResponseStatusCodeInFilename(filename)).toBe(expectedStatusCode)
    })

    it('should return status code with state variable and HTTP verb', () => {
      const filename = '_.DELETE.404.{ERR}.json'
      const expectedStatusCode = 404

      expect(getResponseStatusCodeInFilename(filename)).toBe(expectedStatusCode)
    })
  })

  describe('isBodyEmpty', () => {
    it('should detect an empty body', () => {
      expect(isBodyEmpty({'#body': [null]})).toBeTruthy()
      expect(isBodyEmpty({'#body': '[null]'})).toBeTruthy()
      expect(isBodyEmpty([null])).toBeTruthy()
    })
  })

  describe('getHttpMethodInFilename', () => {
    it('should return default GET', () => {
      const filename = '_.json'
      const expectedHttpVerb = 'GET'

      expect(getHttpMethodInFilename(filename)).toBe(expectedHttpVerb)
    })

    it('should return detected HTTP verb', () => {
      const filename = '_.POST.json'
      const expectedHttpVerb = 'POST'

      expect(getHttpMethodInFilename(filename)).toBe(expectedHttpVerb)
    })
  })
})
