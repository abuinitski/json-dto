const { Dto, DtoFieldError } = require('../dest/index')

describe('DTO', () => {
  describe('custom type', () => {
    beforeAll(() => {
      Dto.registerType('twiceLess', {
        read: input => {
          if (!Number.isInteger(input)) {
            throw new DtoFieldError('toobad', { isay: 'whaaat' })
          }
          return input / 2
        },

        // yeah, exactly symmetric mapping (in 99.99% cases)
        write: input => input * 2,
      })
    })

    test('can be read and written', () => {
      const dto = new Dto({
        thenumber: Dto.twiceLess,
      })

      expect(dto.read({ thenumber: 10 })).toEqual({ thenumber: 5 })
      expect(dto.write({ thenumber: 5 })).toEqual({ thenumber: 10 })
    })

    test('cannot be used with another type', () => {
      const run = () => new Dto({ thenumber: Dto.twiceLess.integer })
      expect(run).toThrow(Error)
    })

    test('translates errors', () => {
      const dto = new Dto({
        thenumber: Dto.twiceLess,
      })

      try {
        dto.read({ thenumber: 10.5 })
        fail()
      } catch (error) {
        expect(error.fieldErrors).toHaveProperty('thenumber')
        expect(error.fieldErrors.thenumber[0]).toHaveProperty('t', 'toobad')
        expect(error.fieldErrors.thenumber[0]).toHaveProperty('isay', 'whaaat')
      }
    })
  })

  describe('custom enum', () => {
    beforeAll(() => {
      Dto.registerEnum('transactionStatus', ['accepted', 'cancelled', 'settled', 'rejected'], {
        revoked: ['cancelled'],
        completed: ['settled', 'rejected'],
      })
    })

    test('is available in DTO description', () => {
      const run = () => new Dto({ status: Dto.transactionStatus })
      expect(run).not.toThrow()
    })

    test('restricts values from outside of allowed scope', () => {
      const dto = new Dto({ status: Dto.transactionStatus })
      try {
        dto.read({ status: 'boomed' })
        fail()
      } catch (error) {
        expect(error.fieldErrors).toHaveProperty('status')
        expect(error.fieldErrors.status[0]).toHaveProperty('t', 'transactionStatus.invalid')
        expect(error.fieldErrors.status[0]).toHaveProperty('allowedValues', [
          'accepted',
          'cancelled',
          'settled',
          'rejected',
        ])
      }
    })

    test('can have limiting sugars', () => {
      const dto = new Dto({ status: Dto.revoked.completed.transactionStatus })
      try {
        dto.read({ status: 'accepted' })
        fail()
      } catch (error) {
        expect(error.fieldErrors).toHaveProperty('status')
        expect(error.fieldErrors.status[0]).toHaveProperty('t', 'transactionStatus.invalid')
        expect(error.fieldErrors.status[0]).toHaveProperty('allowedValues', ['cancelled', 'settled', 'rejected'])
      }
    })
  })
})
