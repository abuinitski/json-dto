const { Dto } = require('../dest/index')

describe('Simple DTO object', () => {
  const dto = new Dto({
    id: Dto.integer({ greaterThan: 0 }),
    age: Dto.optional.positive.integer,
    name: Dto.string,
  })

  test('provides declared interface', () => {
    expect(dto.read).toBeDefined()
    expect(dto.write).toBeDefined()
    expect(dto.readCollection).toBeDefined()
    expect(dto.writeCollection).toBeDefined()
  })

  describe('#read', () => {
    test('reads the object', () => {
      expect(dto.read({ id: 1, name: 'danny' })).toEqual({ id: 1, name: 'danny' })
    })

    test('ignores extra properties in input', () => {
      expect(dto.read({ id: 1, name: 'danny', height: 19 })).toEqual({ id: 1, name: 'danny' })
    })
  })

  describe('#write', () => {
    test('writes the object', () => {
      expect(dto.write({ id: 1, name: 'danny' })).toEqual({ id: 1, name: 'danny' })
    })

    test('only includes relevant properties', () => {
      expect(dto.write({ id: 1, name: 'danny', height: 19 })).toEqual({ id: 1, name: 'danny' })
    })
  })

  test('reads collection of objects', () => {
    expect(dto.readCollection([{ id: 1, name: 'danny' }, { id: 2, name: 'willy' }])).toEqual([
      { id: 1, name: 'danny' },
      { id: 2, name: 'willy' },
    ])
  })

  test('writes collection of objects', () => {
    expect(dto.writeCollection([{ id: 1, name: 'danny' }, { id: 2, name: 'willy' }])).toEqual([
      { id: 1, name: 'danny' },
      { id: 2, name: 'willy' },
    ])
  })
})
