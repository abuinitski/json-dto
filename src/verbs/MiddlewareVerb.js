export default class MiddlewareVerb {
  #name
  #read
  #write

  constructor(name, { read, write }) {
    this.#name = name
    this.#read = read
    this.#write = write
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
}
