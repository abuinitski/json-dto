import FieldBuilder from './FieldBuilder'
import Dto from './Dto'

export default new Proxy(Dto, {
  get(target, propertyName) {
    const fieldBuilder = FieldBuilder(propertyName)
    if (fieldBuilder) {
      return fieldBuilder
    }

    return target[propertyName]
  },
})
