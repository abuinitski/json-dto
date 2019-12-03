import { DtoReadError, DtoWriteError } from './errors'
import ObjectHandler from './ObjectHandler'

export default class Dto {
  #fields
  #readHandler
  #writeHandler

  constructor(fields) {
    const { readHandler, writeHandler } = ObjectHandler.materialize(fields)
    this.#fields = fields
    this.#readHandler = readHandler
    this.#writeHandler = writeHandler
  }

  get fields() {
    return this.#fields
  }

  read(input) {
    return mapObject(input, this.#readHandler, DtoReadError)
  }

  write(input) {
    return mapObject(input, this.#writeHandler, DtoWriteError)
  }

  readCollection(input) {
    return mapCollection(input, this.#readHandler, DtoReadError)
  }

  writeCollection(input) {
    return mapCollection(input, this.#writeHandler, DtoWriteError)
  }
}

function mapObject(input, objectHandler, ErrorType) {
  const output = {}
  const errors = {}

  objectHandler.handleObject(input, output, errors)

  if (Object.keys(errors).length) {
    throw new ErrorType(errors)
  }

  return output
}

function mapCollection(input, objectHandler, ErrorType) {
  if (!input || !input[Symbol.iterator]) {
    throw new ErrorType({ '': [{ t: 'notAnArray' }] })
  }

  const output = (input.length && new Array(input.length)) || []
  let outputIndex = 0

  const errors = {}

  for (const inputItem of input) {
    const objectOutput = {}
    objectHandler.handleObject(inputItem, objectOutput, errors, `[${outputIndex}]`)
    output[outputIndex++] = objectOutput
  }

  if (Object.keys(errors).length) {
    throw new ErrorType(errors)
  }

  return output
}
