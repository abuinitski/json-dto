export default class ObjectHandler {
  static materialize(dtoDescription, baseFieldPrefix = '') {
    const readHandlers = []
    const writeHandlers = []

    for (const [fieldName, fieldBuilder] of Object.entries(dtoDescription)) {
      const materialize = fieldBuilder._materialize

      if (typeof materialize !== 'function') {
        throw new Error(`Dto: configuration for field "${baseFieldPrefix}${fieldName}" is not a field builder`)
      }

      const { read, write } = materialize(fieldName)
      readHandlers.push(read)
      writeHandlers.push(write)
    }

    return {
      readHandler: new ObjectHandler(readHandlers, baseFieldPrefix),
      writeHandler: new ObjectHandler(writeHandlers, baseFieldPrefix),
    }
  }

  #handlers
  #baseFieldPrefix

  constructor(handlers, baseFieldPrefix) {
    this.#handlers = handlers
    this.#baseFieldPrefix = baseFieldPrefix
  }

  handleObject(input, output, errors, fieldPrefix = '') {
    const fullPrefix = `${this.#baseFieldPrefix}${fieldPrefix}`

    for (const handler of this.#handlers) {
      handler(input, output, errors, fullPrefix)
    }
  }
}
