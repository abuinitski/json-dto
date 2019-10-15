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
      verbParams: null,
    },
  ]

  return new Proxy(() => {}, {
    apply(target, thisArg, argArray) {
      const [lastVerbData] = builderVerbData.splice(-1)
      const [nextVerbParams] = argArray

      applyVerb(lastVerbData.verbName, nextVerbParams)

      return thisArg
    },

    get(target, propertyName, receiver) {
      if (propertyName === '_materialize') {
        return fieldName => materializeFieldTransformer(fieldName, builderVerbData)
      }

      applyVerb(propertyName, null)

      return receiver
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

