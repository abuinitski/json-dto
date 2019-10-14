export default class SugarVerb {
  #name
  #parentMiddleware
  #sugarHandler

  constructor(name, parentMiddleware, sugarHandler) {
    this.#name = name
    this.#parentMiddleware = parentMiddleware
    this.#sugarHandler = sugarHandler
  }

  get name() {
    return this.#name
  }

  get parentMiddleware() {
    return this.#parentMiddleware
  }

  get sugarHandler() {
    return this.#sugarHandler
  }
}
