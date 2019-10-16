export class DtoReadError extends Error {
  #fieldErrors = {}

  constructor(fieldErrors) {
    super('DTO: invalid parameters')

    this.#fieldErrors = fieldErrors

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DtoReadError)
    }
  }

  get fieldErrors() {
    return this.#fieldErrors
  }
}

export class DtoWriteError extends Error {
  #fieldErrors = {}

  constructor(fieldErrors) {
    super('DTO: invalid parameters while serializing object')

    this.#fieldErrors = fieldErrors

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DtoWriteError)
    }
  }

  get fieldErrors() {
    return this.#fieldErrors
  }
}

export class DtoFieldError extends Error {
  #code
  #extra

  constructor(code, extra) {
    super()

    this.#code = code
    this.#extra = extra

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DtoWriteError)
    }
  }

  get code() {
    return this.#code
  }

  get extra() {
    return this.#extra
  }
}
