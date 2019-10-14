export default function implicitRequire() {
  return (input, next) => {
    if (input === null || input === undefined) {
      return next(input, { t: 'missing' })
    }

    return next(input)
  }
}
