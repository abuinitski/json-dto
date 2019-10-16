const { Dto } = require('../dest/index')

describe('DTO with array property', () => {
  const dto = new Dto({
    items: Dto.array({
      id: Dto.positive.integer,
      name: Dto.optional.string,
    }),
  })

  test('requires parameter', () => {
    const makeDto = () => new Dto({ failing: Dto.array })
    expect(makeDto).toThrow(Error)
  })

  test('reads an array', () => {
    const item = dto.read({ items: [{ id: 1 }, { id: 2 }, { id: 3, name: 'wozo', age: 13 }] })
    expect(item).toEqual({ items: [{ id: 1 }, { id: 2 }, { id: 3, name: 'wozo' }] })
  })

  test('writes an array', () => {
    const output = dto.write({ items: [{ id: 1 }, { id: 2 }, { id: 3, name: 'wozo', age: 13 }] })
    expect(output).toEqual({ items: [{ id: 1 }, { id: 2 }, { id: 3, name: 'wozo' }] })
  })

  test('reports an error when data is not an array', () => {
    try {
      dto.read({ items: 'wolo' })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('items')
      expect(error.fieldErrors.items[0].t).toBe('array.invalid')
    }
  })

  test('includes all relevant errors for underlying items', () => {
    try {
      dto.read({ items: [{ id: 'one', name: 12 }, { id: -1 }] })
      fail()
    } catch (error) {
      expect(Object.keys(error.fieldErrors).length).toBe(3)
      expect(error.fieldErrors['items[0].id']).toBeTruthy()
      expect(error.fieldErrors['items[0].name']).toBeTruthy()
      expect(error.fieldErrors['items[1].id']).toBeTruthy()
    }
  })

  test('works as expected with nullable modifier', () => {
    const dto = new Dto({
      items: Dto.nullable.array({ id: Dto.integer }),
    })

    expect(dto.read({ items: null })).toEqual({ items: null })
  })

  test('works as expected with optional modifier', () => {
    const dto = new Dto({
      items: Dto.optional.array({ id: Dto.integer }),
    })

    expect(dto.read({})).toEqual({})
  })

  test('produces correct error messages when used with collection methods', () => {
    try {
      dto.readCollection([{ items: [{ id: -1 }] }, { items: [{ id: 1, name: 10 }, { id: -2 }] }])
      fail()
    } catch (error) {
      expect(Object.keys(error.fieldErrors).length).toBe(3)
      expect(error.fieldErrors['[0].items[0].id']).toBeTruthy()
      expect(error.fieldErrors['[1].items[0].name']).toBeTruthy()
      expect(error.fieldErrors['[1].items[1].id']).toBeTruthy()
    }
  })

  test('supports rejecting blank arrays', () => {
    try {
      const dto = new Dto({ items: Dto.nonblank.array({ id: Dto.integer }) })
      dto.read({ items: [] })
      fail()
    } catch (error) {
      expect(error.fieldErrors.items[0]).toHaveProperty('t', 'array.blank')
    }
  })
})
