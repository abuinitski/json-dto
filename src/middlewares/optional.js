import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: () => optional,
    stage: ProcessingStages.Preprocess,
  },
  write: {
    factory: () => optional,
    stage: ProcessingStages.Preprocess,
  },
}

function optional(input, next) {
  if (input === undefined) {
    return undefined
  }

  return next(input)
}
