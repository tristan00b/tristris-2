import { isArray, MakeErrorType, MakeLogger } from '../../utilities'
import * as c from './constants'


/**
 * A module for automatically configuring {@link ShaderProgram} attribute and uniform setters
 *
 * Thanks to {@link https://github.com/greggman|@gregman}, whose work on {@link https://github.com/greggman/twgl.js|twgl.js}
 * was used as a reference for implementing this functionality.
 *
 * @module WebGL/ShaderTypeSetters
 */


/**
 * A constant value corresponding to a WebGL data type (e.g. gl.FLOAT_MAT4)
 * @typedef {Number} TypeSetterMappingFrom
 * @see {@link module:WebGL/Constants}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants|WebGL Constants}
 * @see TypeSetterMappingTo
 * @private
 */


/**
  * An object that associates a shader setter method to its expected argument data type---namely, one of the Javascript
  * Typed Array types
 * @typedef {Object} TypeSetterMappingTo
 * @property {String} setter The name of a static setter method of either {@link ShaderAttributeSetters} or {@link ShaderUniformSetters}
 * @property {TypedArray} type The type of array to wrap data in before sending to the shader
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays}
 * @see TypeSetterMappingFrom
 * @private
 */


/**
 * A symbol or string corresponding to a shader parameter setter
 * @typedef {String} ShaderParameterSetterName The name of a shader attribute or uniform setter
 * @see {@link ShaderAttributeSetters}
 * @see {@link ShaderUniformSetters}
 * @private
 */


/**
 * A generic function signature for shader parameter setters
 * @typedef {function} ShaderParameterSetter
 * @param {extenal:WebGL2RenderingContext} gl The WebGL rendering context
 * @param {external:GLint|external:WebGLUniformLocation} location The shader parameter location
 * @param {Number[]} values An array of values to be sent to the shader
 * @see {@link ShaderAttributeSetters}
 * @see {@link ShaderUniformSetters}
 * @private
 */


/**
 * A generic callback signature for setting shader parameters
 * @callback ShaderParameterSetterCallback
 * @param {extenal:WebGL2RenderingContext} gl The WebGL rendering context
 * @param {String} uniformName The name of the uniform to set, as would be found in an a `WebGLActiveInfo` object returned by `gl.getActiveUniform`
 * @param {Number[]} values The array of values to send to the shader
 * @public
 */


/**
 * A mapping of WebGL data types to WebGL shader parameter setters
 * @type {Object<TypeSetterMappingFrom, TypeSetterMappingTo>}
 * @readonly
 * @private
 */
const ShaderTypeSetterMap = Object.freeze({
  [c.BOOL]              : { setter: 'intVec1Setter',      type: Uint32Array,                       },
  [c.BOOL_VEC2]         : { setter: 'intVec2Setter',      type: Uint32Array,                       },
  [c.BOOL_VEC3]         : { setter: 'intVec3Setter',      type: Uint32Array,                       },
  [c.BOOL_VEC4]         : { setter: 'intVec4Setter',      type: Uint32Array,                       },
  [c.INT]               : { setter: 'intVec1Setter',      type: Int32Array,                        },
  [c.INT_VEC2]          : { setter: 'intVec2Setter',      type: Int32Array,                        },
  [c.INT_VEC3]          : { setter: 'intVec3Setter',      type: Int32Array,                        },
  [c.INT_VEC4]          : { setter: 'intVec4Setter',      type: Int32Array,                        },
  [c.UNSIGNED_INT]      : { setter: 'intVec1Setter',      type: Uint32Array,                       },
  [c.UNSIGNED_INT_VEC2] : { setter: 'intVec2Setter',      type: Uint32Array,                       },
  [c.UNSIGNED_INT_VEC3] : { setter: 'intVec3Setter',      type: Uint32Array,                       },
  [c.UNSIGNED_INT_VEC4] : { setter: 'intVec4Setter',      type: Uint32Array,                       },
  [c.FLOAT]             : { setter: 'floatVec1Setter',    type: Float32Array,                      },
  [c.FLOAT_VEC2]        : { setter: 'floatVec2Setter',    type: Float32Array,                      },
  [c.FLOAT_VEC3]        : { setter: 'floatVec3Setter',    type: Float32Array,                      },
  [c.FLOAT_VEC4]        : { setter: 'floatVec4Setter',    type: Float32Array,                      },
  [c.FLOAT_MAT2]        : { setter: 'floatMatrix2Setter', type: Float32Array,                      },
  [c.FLOAT_MAT3]        : { setter: 'floatMatrix3Setter', type: Float32Array,                      },
  [c.FLOAT_MAT4]        : { setter: 'floatMatrix4Setter', type: Float32Array,                      },
  [c.SAMPLER_2D]        : { setter: 'intVec1Setter',      type: Uint32Array,                       },
})


/**
 * A mapping of the names of shader uniform setters to their resepective implementations
 * @type {Object<ShaderParameterSetterName, ShaderParameterSetter>}
 * @readonly
 * @private
 */
const ShaderUniformSetters = Object.freeze({
  intVec1Setter         : (gl, location, values) => { gl.uniform1iv(location, values)              },
  intVec2Setter         : (gl, location, values) => { gl.uniform2iv(location, values)              },
  intVec3Setter         : (gl, location, values) => { gl.uniform3iv(location, values)              },
  intVec4Setter         : (gl, location, values) => { gl.uniform4iv(location, values)              },
  floatVec1Setter       : (gl, location, values) => { gl.uniform1fv(location, values)              },
  floatVec2Setter       : (gl, location, values) => { gl.uniform2fv(location, values)              },
  floatVec3Setter       : (gl, location, values) => { gl.uniform3fv(location, values)              },
  floatVec4Setter       : (gl, location, values) => { gl.uniform4fv(location, values)              },
  floatMatrix2Setter    : (gl, location, values) => { gl.uniformMatrix2fv(location, false, values) },
  floatMatrix3Setter    : (gl, location, values) => { gl.uniformMatrix3fv(location, false, values) },
  floatMatrix4Setter    : (gl, location, values) => { gl.uniformMatrix4fv(location, false, values) },
})


/**
 * A mapping of the names of shader attribute setters to their resepective implementations
 * @type {Object<ShaderParameterSetterName, ShaderParameterSetter>}
 * @readonly
 * @private
 */
const ShaderAttributeSetters = Object.freeze({
  floatVec1Setter       : (gl, location, values) => { gl.vertexAttrib1fv(location, values)         },
  floatVec2Setter       : (gl, location, values) => { gl.vertexAttrib2fv(location, values)         },
  floatVec3Setter       : (gl, location, values) => { gl.vertexAttrib3fv(location, values)         },
  floatVec4Setter       : (gl, location, values) => { gl.vertexAttrib4fv(location, values)         },
})


/**
 * Creates a shader parameter setter callback
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} info An info object, as returned by `gl.getActiveUniform` or `gl.getActiveAttrib`
 * @param {external:GLint|external:WebGLUniformLocation} location The location of a shader attribute, or uniform, as
 *   returned by `gl.getAttribLocation` or `gl.getUniformLocation`
 * @param {ShaderAttributeSetters|ShaderUniformSetters} setters Either of the two setter mappings above
 * @returns {ShaderParameterSetterCallback}
 * @throws {ShaderTypeSetterError} Throws on unknown parameter types (as given by `info`)
 * @private
 */
function createShaderSetter(gl, info, location, setters)
{
  const typeInfo = ShaderTypeSetterMap[info.type] ?? throw new ShaderTypeSetterError(`Unknown parameter type: ${info.type}`)
  const setter   = setters[typeInfo.setter]
  const Type     = typeInfo.type

  return (context, paramName, data) => {
    setter(context, location, new Type( isArray(data) ? data : [data] ))
  }
}


/**
 * Creates a shader parameter setter callback
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} info An info object, as returned by `gl.getActiveAttrib`
 * @param {GLint} location The location of a shader attribute, as returned by `gl.getAttribLocation`
 * @returns {ShaderParameterSetterCallback}
 * @throws {ShaderTypeSetterError} Throws on unknown parameter types (as given by `info`)
 */
export const createAttributeSetter = (gl, info, location) => createShaderSetter(gl, info, location, ShaderAttributeSetters)


/**
 * Creates a shader parameter setter callback
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} info An info object, as returned by `gl.getActiveUniform`
 * @param {external:WebGLUniformLocation} location The location of a shader uniform, as returned by `gl.getUniformLocation`
 * @returns {ShaderParameterSetterCallback}
 * @throws {ShaderTypeSetterError} Throws on unknown parameter types (as given by `info`)
 */
export const createUniformSetter = (gl, info, location) => createShaderSetter(gl, info, location, ShaderUniformSetters)


export function createUniformBlockSetter(program, buffer, offset=0)
{
  return (context, blockName, data) => {
    buffer.bind(context)
    buffer.subData(context, offset, data)
    buffer.unbind(context)
    buffer.bindBase(context, buffer.bindPoint)
  }
}

/**
 * Creates a setter callback for a given block uniform
 * @param {Number} type A GLenum indicating the type of the block uniform
 * @param {external:WebGLProgram} program A reference to the WebGL shader program for which the setter is being created
 * @param {UniformBuffer} buffer A buffer whose memory is mapped to the uniform block
 * @param {Number} offset The offset (number of bytes) into the buffer for writing data to for the block uniform described by `info`
 * @returns {ShaderParameterSetterCallback}
 * @throws {ShaderTypeSetterError} Throws on unknown uniform types (as given by `info`)
 * @private
 */
export function createBlockUniformSetter(type, program, buffer, offset)
{
  const typeInfo = ShaderTypeSetterMap[type] ?? throw new ShaderTypeSetterError(`Unknown block uniform type: ${type}`)
  const Type = typeInfo.type
  return (context, uniformName, data) => {
    buffer.bind(context)
    buffer.subData(context, offset, new Type( isArray(data) ? data : [data] ))
    buffer.unbind(context)
  }
}


/**
 * Only for logging and throwing errors
 * @private
 */
class ShaderTypeSetter {}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(ShaderTypeSetter)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const ShaderTypeSetterError = MakeErrorType(ShaderTypeSetter)
