// credits: https://medium.com/@fsufitch/is-javascript-array-sort-stable-46b90822543f

export default function stableSort(array, cmp) {
  cmp = !!cmp
    ? cmp
    : (a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      }

  const stabilizedArray = array.map((el, index) => [el, index])

  stabilizedArray.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order) {
      return order
    }
    return a[1] - b[1]
  })

  return stabilizedArray.map(item => item[0])
}
