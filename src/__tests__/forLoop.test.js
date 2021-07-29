import { 
  getForLoopSyntax, 
  getSequenceArray, 
  getContentWithReplacedForLoopsSyntax, 
  getForLoopSyntaxInContent 
} from '../../src/forLoopHelpers'

jest.mock('faker', () => ({
  internet: {
    email: jest.fn().mockImplementation(() => 'fake@email.com' ),
  },
  datatype: {
    boolean: jest.fn().mockImplementation(() => true )
  }
}))

describe('Helper\'s functions to process for loops', () => {
  it('should give correct syntax from object', () => {
    const forLoopObject = {
      x: 'i',
      sequence: '[1, 2]',
      statement: '{"id": "[i]"}'
    }
    const expectedResult = '"#for i in [1, 2]",{"id": "[i]"},"#endfor"'

    expect(getForLoopSyntax(forLoopObject)).toBe(expectedResult)
  })

  describe('Get array from sequence', () => {
    describe('Array notation', () => {
      it('should give array from array notation', () => {
        const arrayNotation = '[1, 2]'
        const expectedResult = [1, 2]

        expect(getSequenceArray(arrayNotation)).toStrictEqual(expectedResult)
      })

      it('should give array from array notation with faker integration', () => {
        const arrayNotation = "['[#faker:internet:email]', '[#faker:internet:email]', [#faker:datatype:boolean]]"
        const expectedResult = ['fake@email.com', 'fake@email.com', true]

        expect(getSequenceArray(arrayNotation)).toStrictEqual(expectedResult)
      })
    })

    describe('Range notation', () => {
      it('should give array from end parameter', () => {
        const arrayNotation = 'range(2)'
        const expectedResult = [0, 1]

        expect(getSequenceArray(arrayNotation)).toStrictEqual(expectedResult)
      })

      it('should give array from start,end parameters', () => {
        const arrayNotation = 'range(1, 3)'
        const expectedResult = [1, 2]

        expect(getSequenceArray(arrayNotation)).toStrictEqual(expectedResult)
      })

      it('should give array from start,end,step parameters', () => {
        const arrayNotation = 'range(0, 16, 5)'
        const expectedResult = [0, 5, 10, 15]
  
        expect(getSequenceArray(arrayNotation)).toStrictEqual(expectedResult)
      })
    })
  })

  it('should find for loops syntax in content', () => {
    const content = '["#for i in [1, 2]",{"id": "[i]"},"#endfor","#for i in range(2)",{"id": "[i]"},"#endfor"]'
    const expectedResult = [
      { x: 'i', sequence: '[1, 2]', statement: '{"id": "[i]"}'},
      { x: 'i', sequence: 'range(2)', statement: '{"id": "[i]"}'}
    ]

    expect(getForLoopSyntaxInContent(content)).toStrictEqual(expectedResult)
  })

  it('should return proceed for loops', () => {
    const content = '["#for i in [1, 2]",{"id": "[i]"},"#endfor","#for i in range(2)",{"id": "[i]"},"#endfor"]'
    const expectedResult = 
      '[{"id": "1"},{"id": "2"},{"id": "0"},{"id": "1"}]'
    
    expect(getContentWithReplacedForLoopsSyntax(content)).toBe(expectedResult)
  })

  it('should return proceed for loops with string and number values in array', () => {
    const content = `["#for animal in ['rabbit', 'mouse', 42]",{"type": "[animal]"},"#endfor"]`
    const expectedResult = 
      '[{"type": "rabbit"},{"type": "mouse"},{"type": "42"}]'
    
    expect(getContentWithReplacedForLoopsSyntax(content)).toBe(expectedResult)
  })

  it('should return proceed for loop with cast x to number notation', () => {
    const content = '["#for i in [1, 2]",{"id": "n:[i]"},"#endfor"]'
    const expectedResult = 
      '[{"id": 1},{"id": 2}]'
    
    expect(getContentWithReplacedForLoopsSyntax(content)).toBe(expectedResult)
  })

  it('should return proceed nested for loop', () => {
    const content = '["#for i in [1, 2]",["#for ii in [1, 2]",{"parent":"n:[i]","id":"n:[ii]"},"#endfor"],"#endfor"]'
    const expectedResult = 
      '[[{"parent":1,"id":1},{"parent":1,"id":2}],[{"parent":2,"id":1},{"parent":2,"id":2}]]'
    
    expect(getContentWithReplacedForLoopsSyntax(content)).toBe(expectedResult)
  })
})