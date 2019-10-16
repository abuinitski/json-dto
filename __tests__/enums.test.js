const { Dto } = require('../dest/index')

describe('DTO enum field', () => {
  const dto = new Dto({
    thenum: Dto.enum(['one', 'two', 'three']),
  })

  test('requires parameter', () => {
    const makeDto = () => new Dto({ failing: Dto.enum })
    expect(makeDto).toThrow(Error)
  })

  test('reads and writes the value', () => {
    expect(dto.read({ thenum: 'one' })).toEqual({ thenum: 'one' })
    expect(dto.write({ thenum: 'one' })).toEqual({ thenum: 'one' })
  })

  test('raises an error if value is outside of allowed values', () => {
    try {
      dto.read({ thenum: 'four' })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('thenum')
      expect(error.fieldErrors.thenum[0]).toHaveProperty('t', 'enum.invalid')
    }
  })
})
