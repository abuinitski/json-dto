import fieldExtractor from './internal_handlers/fieldExtractor'
import ProcessingStages from './ProcessingStages'
import fieldSaver from './internal_handlers/fieldSaver'
import implicitRequire from './internal_handlers/implicitRequire'
import stableSort from './support/stableSort'
import FieldHandler from './FieldHandler'

export default function materializeFieldTransformer(fieldName, verbs) {
  const middlewares = cookVerbsToMiddlewaresWithSugarsApplied(verbs)

  const { reads, writes } = explodeStagedHandlers(middlewares)

  const readHandlers = materializeStagedHandlers(reads, fieldName)
  const writeHandlers = materializeStagedHandlers(writes, fieldName)

  return {
    read: FieldHandler(fieldName, readHandlers),
    write: FieldHandler(fieldName, writeHandlers),
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
    middleware.validateParams(...params)

    if (middleware.read) {
      pushHandler(reads, middleware.read.factory(...params), middleware.read.stage)
    }

    if (middleware.write) {
      pushHandler(writes, middleware.write.factory(...params), middleware.write.stage)
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

  checkConflictingTypeDeclarations(Array.from(middlewares.values()))

  verbs
    .filter(({ sugars }) => Boolean(sugars))
    .forEach(({ sugars, verbParams: sugarParams }) => {
      const sugar = disambiguateSugarVerbs(sugars, middlewares)
      const middleware = middlewares.get(sugar.parentMiddleware.name)

      middleware.params = sugar.sugarHandler(middleware.params, sugarParams)
      if (!Array.isArray(middleware.params)) {
        throw new Error(`invalid sugar implementation for ${sugar.name}: should return an array of arguments`)
      }
    }, new Map())

  return middlewares.values()
}

function checkConflictingTypeDeclarations(middlewares) {
  middlewares.reduce(
    (status, { middleware }) => {
      let { hasReadMap, hasWriteMap } = status

      if (middleware.read && middleware.read.stage === ProcessingStages.Map) {
        if (hasReadMap) {
          throw new Error('Invalid DTO description: conflicting type declarations')
        }
        hasReadMap = true
      }

      if (middleware.write && middleware.write.stage === ProcessingStages.Map) {
        if (hasWriteMap) {
          throw new Error('Invalid DTO description: conflicting type declarations')
        }
        hasWriteMap = true
      }

      return { hasReadMap, hasWriteMap }
    },
    { hasReadMap: false, hasWriteMap: false }
  )
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
