import MiddlewareVerb from './verbs/MiddlewareVerb'
import SugarVerb from './verbs/SugarVerb'
import ProcessingStages from './ProcessingStages'
import { DtoFieldError } from './errors'

class VerbRegistry {
  #middlewares = new Map()
  #sugars = new Map()

  resolveVerbsByName(verbName) {
    return {
      middleware: this.#middlewares.get(verbName),
      sugars: this.#sugars.get(verbName),
    }
  }

  registerType(name, { read, write }) {
    const makeFieldFactory = method => (...args) => (input, next) => {
      try {
        return next(method(input, ...args))
      } catch (error) {
        if (error instanceof DtoFieldError) {
          return next(input, { t: error.code, ...error.extra })
        }
        throw error
      }
    }

    this.registerMiddleware(name, {
      read: {
        factory: makeFieldFactory(read),
        stage: ProcessingStages.Map,
      },
      write: {
        factory: makeFieldFactory(write),
        stage: ProcessingStages.Map,
      },
    })
  }

  registerEnum(name, values, restrictions) {
    const sugars = {}
    const baseValues = new Set(values)

    if (restrictions) {
      for (const [restrictionName, restrictedValues] of Object.entries(restrictions)) {
        sugars[restrictionName] = ([options]) => {
          const prevRestrictions = (options && options.restrictions && Array.from(options.restrictions)) || []

          return [
            {
              ...options,
              restrictions: new Set([...prevRestrictions, ...Array.from(restrictedValues)]),
            },
          ]
        }
      }
    }

    const customEnumFactory = options => (input, next) => {
      const valueSet = (options && options.restrictions) || baseValues
      if (!valueSet.has(input)) {
        return next(input, { t: `${name}.invalid`, allowedValues: Array.from(valueSet) })
      }
      return next(input)
    }

    this.registerMiddleware(name, {
      read: {
        factory: customEnumFactory,
        stage: ProcessingStages.Map,
      },
      write: {
        factory: customEnumFactory,
        stage: ProcessingStages.Map,
      },
      sugars,
    })
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
