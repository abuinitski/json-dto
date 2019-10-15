const sourceMapSupport = require('source-map-support')

module.exports = () => {
  sourceMapSupport.install()
}
