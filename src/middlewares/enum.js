import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: enumFactory,
    stage: ProcessingStages.Map,
  },

  write: {
    factory: enumFactory,
    stage: ProcessingStages.Map,
  },

  requireParameter: true,
}

function enumFactory(values) {
  const set = new Set(values)

  return (input, next) => {
    if (!set.has(input)) {
      return next(input, { t: 'enum.invalid', allowedValues: Array.from(set) })
    }

    return next(input)
  }
}
