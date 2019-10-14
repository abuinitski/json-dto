export default function fieldExtractor(fieldName) {
  return (input, next) => void next(input[fieldName])
}
