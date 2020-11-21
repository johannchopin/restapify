import { getVarsInPath } from '../../../src/server/utils'

describe('getVarsInPath', () => {
  it('find no vars in path', () => {
    const path = '/posts'
    const expectedFoundVars = []

    expect(getVarsInPath(path)).toStrictEqual(expectedFoundVars)
  })

  it('find 1 vars in path', () => {
    const path = '/users/[userid]'
    const expectedFoundVars = ['userid']

    expect(getVarsInPath(path)).toStrictEqual(expectedFoundVars)
  })

  it('find 2 vars in path', () => {
    const path = '/posts/[postid]/comments/[commentid]'
    const expectedFoundVars = ['postid', 'commentid']

    expect(getVarsInPath(path)).toStrictEqual(expectedFoundVars)
  })

  it('find 2 vars in path with json extension', () => {
    const path = '/posts/[postid]/comments/[commentid].json'
    const expectedFoundVars = ['postid', 'commentid']

    expect(getVarsInPath(path)).toStrictEqual(expectedFoundVars)
  })
})
