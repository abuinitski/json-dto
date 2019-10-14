import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: integerFactory,
    stage: ProcessingStages.Map,
  },
  write: {
    factory: integerFactory,
    stage: ProcessingStages.Map,
  },
  sugars: {
    nonZero: options => ({
      ...options,
      allowZero: false,
    }),
    nonNegative: options => ({
      ...options,
      greaterThanOrEqualTo: Math.max((options && options.greaterThanOrEqualTo) || 0, 0),
    }),
    positive: options => ({
      ...options,
      greaterThan: Math.max((options && options.greaterThan) || 0, 0),
    }),
    negative: options => ({
      ...options,
      lessThan: Math.min((options && options.lessThan) || 0, 0),
    }),
  },
}

function integerFactory(inputOptions) {
  const { allowZero, greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo } = inputOptions || {}

  const middlewares = [
    (input, next) => {
      if (Number.isInteger(input)) {
        return next(input)
      }

      return next(input, { t: 'integer.invalid' })
    },
  ]

  if (allowZero === false) {
    middlewares.push((input, next) => {
      if (input === 0) {
        return next(input)
      }

      return next(input, { t: 'integer.failedNonZero' })
    })
  }

  addLimitCheck(greaterThan, n => {
    if (n <= greaterThan) {
      return { t: 'integer.failedGreaterThan', limit: greaterThan }
    }
  })

  addLimitCheck(greaterThanOrEqualTo, n => {
    if (n < greaterThanOrEqualTo) {
      return { t: 'integer.failedGreaterThanOrEqualTo', limit: greaterThanOrEqualTo }
    }
  })

  addLimitCheck(lessThan, n => {
    if (n >= lessThan) {
      return { t: 'integer.failedLessThan', limit: lessThan }
    }
  })

  addLimitCheck(lessThanOrEqualTo, n => {
    if (n > lessThanOrEqualTo) {
      return { t: 'integer.failedLessThanOrEqualTo', limit: lessThanOrEqualTo }
    }
  })

  return middlewares

  function addLimitCheck(limit, checker) {
    if (limit !== null && limit !== undefined) {
      middlewares.push((input, next) => {
        const error = checker(input)
        if (error) {
          return next(input, error)
        }
        return next(input)
      })
    }
  }
}
