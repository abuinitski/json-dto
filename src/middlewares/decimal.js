import ProcessingStages from '../ProcessingStages'

export default {
  read: {
    factory: decimalFactory,
    stage: ProcessingStages.Map,
  },
  write: {
    factory: decimalFactory,
    stage: ProcessingStages.Map,
  },
  sugars: {
    nonZero: ([options = {}]) => [
      {
        ...options,
        allowZero: false,
      },
    ],
    nonNegative: ([options = {}]) => [
      {
        ...options,
        greaterThanOrEqualTo: Math.max((options && options.greaterThanOrEqualTo) || 0, 0),
      },
    ],
    positive: ([options = {}]) => [
      {
        ...options,
        greaterThan: Math.max((options && options.greaterThan) || 0, 0),
      },
    ],
    negative: ([options = {}]) => [
      {
        ...options,
        lessThan: Math.min((options && options.lessThan) || 0, 0),
      },
    ],
  },
}

function decimalFactory(inputOptions) {
  const { allowZero, greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo } = inputOptions || {}

  const middlewares = [
    (input, next) => {
      if (Number.isFinite(input)) {
        return next(input)
      }

      return next(input, { t: 'decimal.invalid' })
    },
  ]

  if (allowZero === false) {
    middlewares.push((input, next, { saveFieldError }) => {
      if (input === 0) {
        saveFieldError({ t: 'decimal.zero' })
      }

      return next(input)
    })
  }

  addLimitCheck(greaterThan, n => {
    if (n <= greaterThan) {
      return { t: 'decimal.failedGreaterThan', limit: greaterThan }
    }
  })

  addLimitCheck(greaterThanOrEqualTo, n => {
    if (n < greaterThanOrEqualTo) {
      return { t: 'decimal.failedGreaterThanOrEqualTo', limit: greaterThanOrEqualTo }
    }
  })

  addLimitCheck(lessThan, n => {
    if (n >= lessThan) {
      return { t: 'decimal.failedLessThan', limit: lessThan }
    }
  })

  addLimitCheck(lessThanOrEqualTo, n => {
    if (n > lessThanOrEqualTo) {
      return { t: 'decimal.failedLessThanOrEqualTo', limit: lessThanOrEqualTo }
    }
  })

  return middlewares

  function addLimitCheck(limit, checker) {
    if (limit !== null && limit !== undefined) {
      middlewares.push((input, next, { saveFieldError }) => {
        const error = checker(input)
        if (error) {
          saveFieldError(error)
        }
        return next(input)
      })
    }
  }
}
