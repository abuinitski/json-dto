import DtoDsl from './DtoDsl'

import VerbRegistry from './VerbRegistry'
import { DtoReadError, DtoWriteError } from './errors'

import optional from './middlewares/optional'
import integer from './middlewares/integer'
import nullable from './middlewares/nullable'
import string from './middlewares/string'
import array from './middlewares/array'
import object from './middlewares/object'
import enumMiddleware from './middlewares/enum'

VerbRegistry.registerMiddleware('optional', optional)
VerbRegistry.registerMiddleware('integer', integer)
VerbRegistry.registerMiddleware('string', string)
VerbRegistry.registerMiddleware('array', array)
VerbRegistry.registerMiddleware('object', object)
VerbRegistry.registerMiddleware('nullable', nullable)
VerbRegistry.registerMiddleware('enum', enumMiddleware)

module.exports = { Dto: DtoDsl, DtoReadError, DtoWriteError }
