const { Dto } = require('../dest/index')

describe('DTO string field', () => {
  test('reads and writes simple strings', () => {
    const dto = new Dto({
      simple: Dto.string,
    })

    expect(dto.read({ simple: 'simple' })).toEqual({ simple: 'simple' })
    expect(dto.write({ simple: 'simple' })).toEqual({ simple: 'simple' })
  })

  test('supports rejecting blank strings', () => {
    const dto = new Dto({
      rich: Dto.nonblank.string,
    })

    testError({ rich: '' }, 'string.blank')
    testError({ rich: ' ' }, 'string.blank')
    testError({ rich: '\t\n  ' }, 'string.blank')

    function testError(input, message) {
      try {
        dto.read(input)
        fail()
      } catch (error) {
        expect(error.fieldErrors).toHaveProperty('rich')
        expect(error.fieldErrors.rich[0]).toHaveProperty('t', message)
      }
    }
  })
})
