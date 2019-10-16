import ProcessingStages from '../ProcessingStages'
import ObjectHandler from '../ObjectHandler'

export default {
  read: {
    factory: dtoDescription => objectFactory(dtoDescription, 'readHandler'),
    stage: ProcessingStages.Map,
  },

  write: {
    factory: dtoDescription => objectFactory(dtoDescription, 'writeHandler'),
    stage: ProcessingStages.Map,
  },

  requireParameter: true,
}

function objectFactory(dtoDescription, handlerName) {
  const handler = ObjectHandler.materialize(dtoDescription)[handlerName]

  return (input, next, { fieldPath, saveErrors }) => {
    if (!input || typeof input !== 'object') {
      return next(input, { t: 'object.invalid' })
    }

    const errors = {}
    const output = {}

    handler.handleObject(input, output, errors, fieldPath)

    if (Object.keys(errors).length) {
      saveErrors(errors)
      return output
    }

    return next(output)
  }
}
