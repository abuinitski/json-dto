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
}

function stringFactory() {
  return (input, next) => {
    if (typeof input === 'string') {
      return next(input)
    }

    return next(input, { t: 'string.invalid' })
  }
}
