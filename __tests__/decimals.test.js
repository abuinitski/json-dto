const { Dto } = require('../dest/index')

describe('DTO decimals', () => {
  test('reads and writes a decimal', () => {
    const dto = new Dto({ amount: Dto.decimal })
    expect(dto.read({ amount: 1.25 })).toEqual({ amount: 1.25 })
    expect(dto.write({ amount: 1.3 })).toEqual({ amount: 1.3 })
  })

  test('allows to reject zeros', () => {
    try {
      const dto = new Dto({ amount: Dto.decimal.nonZero })
      dto.read({ amount: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('amount')
      expect(error.fieldErrors.amount[0]).toHaveProperty('t', 'decimal.zero')
    }
  })

  test('allows to reject negative decimals', () => {
    try {
      const dto = new Dto({ decimal: Dto.decimal.nonNegative })
      dto.read({ decimal: -1 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('decimal')
      expect(error.fieldErrors.decimal[0]).toHaveProperty('t', 'decimal.failedGreaterThanOrEqualTo')
      expect(error.fieldErrors.decimal[0]).toHaveProperty('limit', 0)
    }
  })

  test('allows to require positive decimals ', () => {
    try {
      const dto = new Dto({ amount: Dto.decimal.positive })
      dto.read({ amount: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('amount')
      expect(error.fieldErrors.amount[0]).toHaveProperty('t', 'decimal.failedGreaterThan')
      expect(error.fieldErrors.amount[0]).toHaveProperty('limit', 0)
    }
  })

  test('allows to require negative numbers', () => {
    try {
      const dto = new Dto({ amount: Dto.negative.decimal })
      dto.read({ amount: 0 })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('amount')
      expect(error.fieldErrors.amount[0]).toHaveProperty('t', 'decimal.failedLessThan')
      expect(error.fieldErrors.amount[0]).toHaveProperty('limit', 0)
    }
  })
})
