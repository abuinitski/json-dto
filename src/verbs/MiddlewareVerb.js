export default class MiddlewareVerb {
  #name
  #read
  #write
  #requireParameter
  #validateParams

  constructor(name, { read, write, requireParameter, validateParams }) {
    this.#name = name
    this.#read = read
    this.#write = write
    this.#requireParameter = requireParameter
    this.#validateParams = validateParams
  }

  get name() {
    return this.#name
  }

  get read() {
    return this.#read
  }

  get write() {
    return this.#write
  }

  validateParams(...params) {
    if (this.#requireParameter && !params.length) {
      throw new Error(`DTO description error: middleware ${name} requires parameter`)
    }

    if (this.#validateParams) {
      this.#validateParams(...params)
    }
  }
}
