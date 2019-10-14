export default class Dto {
  #readHandlers = []
  #writeHandlers = []

  constructor(fields) {
    for (const [fieldName, fieldBuilder] of Object.entries(fields)) {
      const materialize = fieldBuilder._materialize

      if (typeof materialize !== 'function') {
        throw new Error(`Dto: configuration for field "${fieldName}" is not a field builder`)
      }

      const { read, write } = materialize(fieldName)
      this.#readHandlers.push(read)
      this.#writeHandlers.push(write)
    }
  }

  read(input) {
    const output = {}
    for (const handler of this.#readHandlers) {
      handler(input, output)
    }
    return output
  }

  write(input) {
    const output = {}
    for (const handler of this.#writeHandlers) {
      handler(input, output)
    }
    return output
  }

  readList(input) {
    if (!input || !input[Symbol.iterator]) {
      throw new Error('readList: input is not iterable')
    }

    const output = (input.length && new Array(input.length)) || []
    let outputIndex = 0

    for (const inputItem of input) {
      output[outputIndex++] = this.read(inputItem)
    }

    return output
  }

  writeList(input) {
    if (!input || !input[Symbol.iterator]) {
      throw new Error('writeList: input is not iterable')
    }

    const output = (input.length && new Array(input.length)) || []
    let outputIndex = 0

    for (const inputItem of input) {
      output[outputIndex++] = this.write(inputItem)
    }

    return output
  }
}
