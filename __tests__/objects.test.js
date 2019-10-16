const { Dto } = require('../dest/index')

describe('DTO object field', () => {
  const dto = new Dto({
    item: Dto.object({
      id: Dto.positive.integer,
      name: Dto.optional.string,
    }),
  })

  test('requires parameter', () => {
    const makeDto = () => new Dto({ failing: Dto.object })
    expect(makeDto).toThrow(Error)
  })

  test('reads an object', () => {
    const item = dto.read({ item: { id: 1 } })
    expect(item).toEqual({ item: { id: 1 } })
  })

  test('writes an object', () => {
    const output = dto.write({ item: { id: 1, name: 'bozo', age: 20 } })
    expect(output).toEqual({ item: { id: 1, name: 'bozo' } })
  })

  test('reports an error when object is not an array', () => {
    try {
      dto.read({ item: 'wolo' })
      fail()
    } catch (error) {
      expect(error.fieldErrors).toHaveProperty('item')
      expect(error.fieldErrors.item[0].t).toBe('object.invalid')
    }
  })

  test('includes all relevant errors for underlying fields', () => {
    try {
      dto.read({ item: { id: 'one', name: 12 } })
      fail()
    } catch (error) {
      expect(Object.keys(error.fieldErrors).length).toBe(2)
      expect(error.fieldErrors['item.id']).toBeTruthy()
      expect(error.fieldErrors['item.name']).toBeTruthy()
    }
  })

  test('works as expected with nullable modifier', () => {
    const dto = new Dto({
      item: Dto.nullable.object({ id: Dto.integer }),
    })

    expect(dto.read({ item: null })).toEqual({ item: null })
  })

  test('works as expected with optional modifier', () => {
    const dto = new Dto({
      item: Dto.optional.object({ id: Dto.integer }),
    })

    expect(dto.read({})).toEqual({})
  })

  test('produces correct error messages when used with collection methods', () => {
    try {
      dto.readCollection([{ item: { id: -1 } }, { item: { id: 1, name: 10 } }])
      fail()
    } catch (error) {
      expect(Object.keys(error.fieldErrors).length).toBe(2)
      expect(error.fieldErrors['[0].item.id']).toBeTruthy()
      expect(error.fieldErrors['[1].item.name']).toBeTruthy()
    }
  })
})
