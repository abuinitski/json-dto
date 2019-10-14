import VerbRegistry from './VerbRegistry'
import fieldExtractor from './internal_handlers/fieldExtractor'
import fieldSaver from './internal_handlers/fieldSaver'
import ProcessingStages from './ProcessingStages'
import implicitRequire from './internal_handlers/implicitRequire'
import stableSort from './support/stableSort'

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

function materializeFieldTransformer(fieldName, verbs) {
  const middlewares = cookVerbsToMiddlewaresWithSugarsApplied(verbs)
  const { reads, writes } = explodeStagedHandlers(middlewares)

  const readHandlers = materializeStagedHandlers(reads, fieldName)
  const writeHandlers = materializeStagedHandlers(writes, fieldName)

  return {
    read: makeFieldHandler(fieldName, readHandlers),
    write: makeFieldHandler(fieldName, writeHandlers),
  }
}

function materializeStagedHandlers(stagedHandlers, fieldName) {
  const extractor = {
    handler: fieldExtractor(fieldName),
    stage: ProcessingStages.Extract,
  }

  const saver = {
    handler: fieldSaver(fieldName),
    stage: ProcessingStages.Set,
  }

  const valuePresenceChecker = {
    handler: implicitRequire(),
    stage: ProcessingStages.Map,
  }

  const allStagedHandlers = [extractor, valuePresenceChecker, ...stagedHandlers, saver]
  return stableSort(allStagedHandlers, compareByStage).map(({ handler }) => handler)
}

function explodeStagedHandlers(middlewares) {
  const reads = []
  const writes = []

  for (const { middleware, params } of middlewares) {
    if (middleware.read) {
      pushHandler(reads, middleware.read.factory(params), middleware.read.stage)
    }

    if (middleware.write) {
      pushHandler(writes, middleware.write.factory(params), middleware.write.stage)
    }
  }

  return {
    reads,
    writes,
  }

  function pushHandler(handlers, handler, stage) {
    if (Array.isArray(handler)) {
      return void handlers.push(
        ...handler.map(oneHandler => ({
          handler: oneHandler,
          stage,
        }))
      )
    }

    handlers.push({
      handler,
      stage,
    })
  }
}

function makeFieldHandler(fieldName, handlers) {
  const makeStageExecutor = (handlerIndex, handlerExtra) => (input, error) => {
    if (error) {
      throw new Error(`error mapping field ${fieldName}: ${JSON.stringify(error)}`)
    }

    if (handlerIndex >= handlers.length) {
      return input
    }

    const handler = handlers[handlerIndex]
    const next = makeStageExecutor(handlerIndex + 1, handlerExtra)

    return handler(input, next, handlerExtra)
  }

  return (input, output) => {
    const handlerExtra = {
      saveField: fieldValue => {
        output[fieldName] = fieldValue
        return output
      },
    }

    makeStageExecutor(0, handlerExtra)(input)
  }
}

function cookVerbsToMiddlewaresWithSugarsApplied(verbs) {
  const middlewares = verbs
    .filter(({ middleware }) => Boolean(middleware))
    .reduce(
      (map, { middleware, verbParams: params }) =>
        map.set(middleware.name, {
          middleware,
          params,
        }),
      new Map()
    )

  verbs
    .filter(({ sugars }) => Boolean(sugars))
    .forEach(({ sugars, verbParams: sugarParams }) => {
      const sugar = disambiguateSugarVerbs(sugars, middlewares)
      const middleware = middlewares.get(sugar.parentMiddleware.name)

      middleware.params = sugar.sugarHandler(middleware.params, sugarParams)
    }, new Map())

  return middlewares.values()
}

function disambiguateSugarVerbs(ambiguousSugars, middlewares) {
  const disambiguatedSugars = ambiguousSugars.filter(sugarVerb => middlewares.has(sugarVerb.parentMiddleware.name))

  if (disambiguatedSugars.length !== 1) {
    throw new Error(`Dto.FieldBuilder: cannot disambiguate "${ambiguousSugars[0].name}" based on other verbs`)
  }

  return disambiguatedSugars[0]
}

function compareByStage({ stage: leftStage }, { stage: rightStage }) {
  return leftStage - rightStage
}
