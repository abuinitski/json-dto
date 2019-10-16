const { Dto, DtoReadError, DtoWriteError } = require('../dest/index')

describe('DTO', () => {
  const dto = new Dto({
    id: Dto.integer,
    age: Dto.optional.positive.integer,
    name: Dto.string,
  })

  describe('read', () => {
    test('throws DtoReadError when something is wrong', () => {
      const run = () => dto.read({ id: null, age: '10', name: 10 })
      expect(run).toThrow(DtoReadError)
    })

    test('includes field errors in DtoReadError', () => {
      try {
        dto.read({ id: null, age: '10', name: 10 })
        fail()
      } catch (error) {
        expect(error.fieldErrors).toHaveProperty('id')
        expect(Array.isArray(error.fieldErrors.id)).toBeTruthy()

        expect(error.fieldErrors).toHaveProperty('age')
        expect(Array.isArray(error.fieldErrors.age)).toBeTruthy()

        expect(error.fieldErrors).toHaveProperty('name')
        expect(Array.isArray(error.fieldErrors.name)).toBeTruthy()
      }
    })

    test('includes translation key in field errors', () => {
      try {
        dto.read({ id: 10 })
        fail()
      } catch (error) {
        expect(error.fieldErrors.name[0]).toHaveProperty('t')
        expect(error.fieldErrors.name[0].t).toBe('missing')
      }
    })

    test('includes field name in field errors', () => {
      try {
        dto.read({ id: 10 })
        fail()
      } catch (error) {
        expect(error.fieldErrors.name[0]).toHaveProperty('fieldName')
        expect(error.fieldErrors.name[0].fieldName).toBe('name')
      }
    })
  })

  describe('readCollection', () => {
    test('raises DtoReadError when something is wrong', () => {
      const run = () => dto.readCollection([{ id: 10 }])
      expect(run).toThrow(DtoReadError)
    })

    test('enhances field names with indexes', () => {
      try {
        dto.readCollection([{ id: 10 }])
        fail()
      } catch (error) {
        expect(error.fieldErrors['[0].name']).toBeTruthy()
      }
    })

    test('includes all errors for each item', () => {
      try {
        dto.readCollection([{ id: 10 }, { id: 20 }])
        fail()
      } catch (error) {
        expect(Object.keys(error.fieldErrors).length).toBe(2)
      }
    })
  })

  describe('write', () => {
    test('throws DtoWriteError when something is wrong', () => {
      const run = () => dto.write({})
      expect(run).toThrow(DtoWriteError)
    })
  })

  describe('writeCollection', () => {
    test('raises DtoWriteError when something is wrong', () => {
      const run = () => dto.writeCollection([{}])
      expect(run).toThrow(DtoWriteError)
    })
  })
})
