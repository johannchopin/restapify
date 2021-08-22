import { replaceAllCastedVar } from "../variableCastingHelpers"

describe('Variables casting helper', () => {
  describe('replaceAllCastedVars', () => {
    it('should replace all boolean casted variables', () => {
      expect(replaceAllCastedVar('"b:[bool]", "b:[bool]"', 'bool', 'true')).toBe('true, true')
    })
    it('should replace all number casted variables', () => {
      expect(replaceAllCastedVar('"n:[numb]", "n:[numb]"', 'numb', '42')).toBe('42, 42')
    })

    it('should throw an error on invalid boolean casting', () => {
      expect(() => {
        replaceAllCastedVar('"b:[bool]"', 'bool', 'not-a-boolean')
      }).toThrow(JSON.stringify({
        error: "ERR",
        message: 'Error: `not-a-boolean` is not a valid boolean. Impossible to cast it for `"b:[bool]"`'
      }))
    })

    it('should throw an error on invalid number casting', () => {
      expect(() => {
        replaceAllCastedVar('"n:[numb]"', 'numb', 'not-a-number')
      }).toThrow(JSON.stringify({
        error: "ERR",
        message: 'Error: `not-a-number` is not a valid number. Impossible to cast it for `"n:[numb]"`'
      }))
    })
  })
})
