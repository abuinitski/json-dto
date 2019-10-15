import ProcessingStages from '../ProcessingStages'
import ObjectHandler from '../ObjectHandler'

export default {
  read: {
    factory: dtoDescription => arrayFactory(dtoDescription, 'readHandler'),
    stage: ProcessingStages.Map,
  },
  write: {
    factory: dtoDescription => arrayFactory(dtoDescription, 'writeHandler'),
    stage: ProcessingStages.Map,
  },
}

function arrayFactory(dtoDescription, handlerName) {
  const handler = ObjectHandler.materialize(dtoDescription)[handlerName]

  return (input, next, { fieldPath, saveErrors }) => {
    if (!Array.isArray(input)) {
      return next(input, { t: 'array.invalid' })
    }

    const errors = {}
    const output = input.map((itemInput, itemIndex) =>
      handler.handleObject(itemInput, {}, errors, `${fieldPath}[${itemIndex}]`)
    )

    if (Object.keys(errors).length) {
      saveErrors(errors)
      return output
    }

    return next(output)
  }
}
