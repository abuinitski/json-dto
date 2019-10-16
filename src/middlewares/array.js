import ProcessingStages from '../ProcessingStages'
import ObjectHandler from '../ObjectHandler'

export default {
  read: {
    factory: (dtoDescription, options = {}) => arrayFactory(dtoDescription, options, 'readHandler'),
    stage: ProcessingStages.Map,
  },

  write: {
    factory: (dtoDescription, options = {}) => arrayFactory(dtoDescription, options, 'writeHandler'),
    stage: ProcessingStages.Map,
  },

  requireParameter: true,

  sugars: {
    nonblank: ([dtoDescription, options = {}]) => [
      dtoDescription,
      {
        ...options,
        allowBlank: false,
      },
    ],
  },
}

function arrayFactory(dtoDescription, { allowBlank = true }, handlerName) {
  const handler = ObjectHandler.materialize(dtoDescription)[handlerName]

  const middlewares = [
    (input, next, { fieldPath, saveErrors }) => {
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
    },
  ]

  if (allowBlank === false) {
    middlewares.push((input, next) => {
      if (!input.length) {
        return next(input, { t: 'array.blank' })
      }
      return next(input)
    })
  }

  return middlewares
}
