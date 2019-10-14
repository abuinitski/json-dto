import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: () => nullable,
    stage: ProcessingStages.Preprocess,
  },
  write: {
    factory: () => nullable,
    stage: ProcessingStages.Preprocess,
  },
}

function nullable(input, next, { saveField }) {
  if (input ===  null) {
    return saveField(null)
  }

  return next(input)
}
