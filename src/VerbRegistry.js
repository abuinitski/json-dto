import MiddlewareVerb from './verbs/MiddlewareVerb'
import SugarVerb from './verbs/SugarVerb'

class VerbRegistry {
  #middlewares = new Map()
  #sugars = new Map()

  resolveVerbsByName(verbName) {
    return {
      middleware: this.#middlewares.get(verbName),
      sugars: this.#sugars.get(verbName),
    }
  }

  registerMiddleware(name, { sugars, ...middlewareConfig }) {
    const middleware = new MiddlewareVerb(name, middlewareConfig)

    if (this.#middlewares.has(middleware.name) || this.#sugars.has(middleware.name)) {
      throw new Error(`Dto.registerMiddleware: name "${middleware.name}" is already taken`)
    }

    this.#middlewares.set(middleware.name, middleware)

    if (sugars) {
      for (const [sugarName, sugarValue] of Object.entries(sugars)) {
        const sugar = new SugarVerb(sugarName, middleware, sugarValue)

        if (this.#middlewares.has(sugar.name)) {
          // sugars are allowed to have ambiguous names
          throw new Error(`Dto.registerMiddleware: name "${sugar.name}" is already taken`)
        }

        if (!this.#sugars.has(sugar.name)) {
          this.#sugars.set(sugar.name, [])
        }

        this.#sugars.get(sugar.name).push(sugar)
      }
    }
  }
}

export default new VerbRegistry()
