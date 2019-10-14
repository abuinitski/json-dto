require('source-map-support').install();

const { Dto } = require('../index')

describe('Simple DTO object', () => {
  let dto

  beforeEach(() => {
    dto = new Dto({
      id: Dto.integer,
      age: Dto.optional.positive.integer,
      name: Dto.string,
    })
  })

  test('provides declared interface', () => {
    expect(dto.read).toBeDefined()
    expect(dto.write).toBeDefined()
    expect(dto.readList).toBeDefined()
    expect(dto.writeList).toBeDefined()
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
    expect(dto.readList([{ id: 1, name: 'danny' }, { id: 2, name: 'willy' }])).toEqual([
      { id: 1, name: 'danny' },
      { id: 2, name: 'willy' },
    ])
  })

  test('writes collection of objects', () => {
    expect(dto.writeList([{ id: 1, name: 'danny' }, { id: 2, name: 'willy' }])).toEqual([
      { id: 1, name: 'danny' },
      { id: 2, name: 'willy' },
    ])
  })
})
