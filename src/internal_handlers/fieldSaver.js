export default function fieldSaver() {
  return (input, next, { saveField }) => next(saveField(input))
}
