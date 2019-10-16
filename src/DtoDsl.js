import FieldBuilder from './FieldBuilder'
import Dto from './Dto'
import VerbRegistry from './VerbRegistry'

export default new Proxy(Dto, {
  get(target, propertyName) {
    if (propertyName === 'registerType') {
      return (...args) => VerbRegistry.registerType(...args)
    }

    if (propertyName === 'registerEnum') {
      return (...args) => VerbRegistry.registerEnum(...args)
    }

    if (propertyName === 'registerMiddleware') {
      return (...args) => VerbRegistry.registerMiddleware(...args)
    }

    const fieldBuilder = FieldBuilder(propertyName)
    if (fieldBuilder) {
      return fieldBuilder
    }

    return target[propertyName]
  },
})
