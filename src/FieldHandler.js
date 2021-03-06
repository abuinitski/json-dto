export default function FieldHandler(fieldName, stageHandlers) {
  const makeStageExecutor = (handlerIndex, handlerExtra) => (input, error) => {
    if (error) {
      handlerExtra.saveFieldError(error)
      return input
    }

    if (handlerIndex >= stageHandlers.length) {
      return input
    }

    const handler = stageHandlers[handlerIndex]
    const next = makeStageExecutor(handlerIndex + 1, handlerExtra)

    return handler(input, next, handlerExtra)
  }

  return (input, output, errors, fieldPrefix) => {
    const fieldPath = (fieldPrefix && `${fieldPrefix}.${fieldName}`) || fieldName

    const handlerExtra = {
      fieldName,

      fieldPath,

      saveField: fieldValue => {
        output[fieldName] = fieldValue
        return output
      },

      saveFieldError: error => {
        let cookedError = error
        if (typeof cookedError.t === 'string') {
          cookedError = {
            ...cookedError,
            fieldName,
            fieldPath,
          }
        }

        if (!errors[fieldPath]) {
          errors[fieldPath] = []
        }

        errors[fieldPath].push(cookedError)
      },

      saveErrors: otherErrors => {
        for (const [otherFieldName, otherFieldErrors] of Object.entries(otherErrors)) {
          errors[otherFieldName] = [...(errors[otherFieldName] || []), ...otherFieldErrors]
        }
      },
    }

    makeStageExecutor(0, handlerExtra)(input)
  }
}
