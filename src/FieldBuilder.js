import VerbRegistry from './VerbRegistry'
import materializeFieldTransformer from './materializeFieldTransformer'

export default function FieldBuilder(firstVerbName) {
  const firstVerbs = VerbRegistry.resolveVerbsByName(firstVerbName)
  if (!firstVerbs.middleware && !firstVerbs.sugars) {
    return undefined
  }

  // builder is stateful and mutates itself as pattern implies
  const builderVerbData = [
    {
      middleware: firstVerbs.middleware,
      sugars: firstVerbs.sugars,
      verbName: firstVerbName,
      verbParams: [],
    },
  ]

  const proxyTarget = () => {}

  return new Proxy(proxyTarget, {
    apply(target, thisArg, argArray) {
      const [lastVerbData] = builderVerbData.splice(-1)

      applyVerb(lastVerbData.verbName, argArray)

      return new Proxy(proxyTarget, this)
    },

    get(target, propertyName) {
      if (propertyName === '_materialize') {
        return fieldName => materializeFieldTransformer(fieldName, builderVerbData)
      }

      applyVerb(propertyName, [])

      return new Proxy(proxyTarget, this)
    },
  })

  function applyVerb(verbName, verbParams) {
    const { middleware, sugars } = VerbRegistry.resolveVerbsByName(verbName)
    if (!middleware && !sugars) {
      return undefined
    }

    builderVerbData.push({
      middleware,
      sugars,
      verbName,
      verbParams,
    })
  }
}

