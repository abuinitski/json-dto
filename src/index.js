import DtoDsl from './DtoDsl'

import VerbRegistry from './VerbRegistry'

import optional from './middlewares/optional'
import integer from './middlewares/integer'
import nullable from './middlewares/nullable'
import string from './middlewares/string'

VerbRegistry.registerMiddleware('optional', optional)
VerbRegistry.registerMiddleware('integer', integer)
VerbRegistry.registerMiddleware('string', string)
VerbRegistry.registerMiddleware('nullable', nullable)

module.exports = { Dto: DtoDsl }
