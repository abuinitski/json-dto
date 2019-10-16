const { Dto } = require('../dest/index')

describe('DTO integers', () => {
  test('reads and writes an integer', () => {
    const dto = new Dto({ id: Dto.integer })
    expect(dto.read({ id: 1 })).toEqual({ id: 1 })
    expect(dto.write({ id: 1 })).toEqual({ id: 1 })
  })

  test('rejects floating numbers', () => {
    try {
      const dto = new Dto({ id: Dto.integer })
      dto.read({ id: 1.2 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('id')
      expect(error.fieldErrors.id[0]).toHaveProperty('t', 'integer.invalid')
    }
  })

  test('allows to reject zeros', () => {
    try {
      const dto = new Dto({ id: Dto.integer.nonZero })
      dto.read({ id: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('id')
      expect(error.fieldErrors.id[0]).toHaveProperty('t', 'integer.zero')
    }
  })

  test('allows to reject negative numbers', () => {
    try {
      const dto = new Dto({ id: Dto.integer.nonNegative })
      dto.read({ id: -1 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('id')
      expect(error.fieldErrors.id[0]).toHaveProperty('t', 'integer.failedGreaterThanOrEqualTo')
      expect(error.fieldErrors.id[0]).toHaveProperty('limit', 0)
    }
  })

  test('allows to require positive numbers ', () => {
    try {
      const dto = new Dto({ id: Dto.integer.positive })
      dto.read({ id: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('id')
      expect(error.fieldErrors.id[0]).toHaveProperty('t', 'integer.failedGreaterThan')
      expect(error.fieldErrors.id[0]).toHaveProperty('limit', 0)
    }
  })

  test('allows to require negative numbers', () => {
    try {
      const dto = new Dto({ id: Dto.negative.integer })
      dto.read({ id: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('id')
      expect(error.fieldErrors.id[0]).toHaveProperty('t', 'integer.failedLessThan')
      expect(error.fieldErrors.id[0]).toHaveProperty('limit', 0)
    }
  })
})
