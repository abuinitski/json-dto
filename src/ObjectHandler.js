export default class ObjectHandler {
  static materialize(dtoDescription) {
    const readHandlers = []
    const writeHandlers = []

    for (const [fieldName, fieldBuilder] of Object.entries(dtoDescription)) {
      const materialize = fieldBuilder._materialize

      if (typeof materialize !== 'function') {
        throw new Error(`Dto: configuration for field "${fieldName}" is not a field builder`)
      }

      const { read, write } = materialize(fieldName)
      readHandlers.push(read)
      writeHandlers.push(write)
    }

    return {
      readHandler: new ObjectHandler(readHandlers),
      writeHandler: new ObjectHandler(writeHandlers),
    }
  }

  #handlers

  constructor(handlers) {
    this.#handlers = handlers
  }

  handleObject(input, output, errors, fieldPrefix = '') {
    for (const handler of this.#handlers) {
      handler(input, output, errors, fieldPrefix)
    }
    return output
  }
}
