import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: stringFactory,
    stage: ProcessingStages.Map,
  },

  write: {
    factory: stringFactory,
    stage: ProcessingStages.Map,
  },

  sugars: {
    nonblank: ([options = {}]) => [
      {
        ...options,
        allowBlank: false,
      },
    ],
  },
}

function stringFactory(options = {}) {
  const { allowBlank = true } = options

  const middlewares = [
    (input, next) => {
      if (typeof input === 'string') {
        return next(input)
      }

      return next(input, { t: 'string.invalid' })
    },
  ]

  if (allowBlank === false) {
    middlewares.push((input, next) => {
      if (!input.replace(/\s+/g, '')) {
        return next(input, { t: 'string.blank' })
      }
      return next(input)
    })
  }

  return middlewares
}
