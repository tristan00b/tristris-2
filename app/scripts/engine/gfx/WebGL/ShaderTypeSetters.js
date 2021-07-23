import { MakeErrorType, MakeLogger } from '../../utilities'
import * as c from './constants'


/**
 * A module for automatically configuring {@link ShaderProgram} attribute/uniform setters
 *
 * Credit to {@link https://github.com/greggman|@gregman} whose work on {@link https://github.com/greggman/twgl.js|twgl.js} was used as a reference for implementing this functionality.
 *
 * @module WebGL/ShaderTypeSetters
 */


/**
 * Enumerator for {@link ShaderProgram} setter types
 * @enum {Number}
 * @readonly
 * @private
 */
const SetterType = Object.freeze({
  ATTRIBUTE : 0,
  UNIFORM   : 1,
})


/**
 * A constant corresponding to a WebGL Attribute or Uniform data type (e.g. WebGL.FLOAT_MAT4)
 * @typedef {Number} TypeSetterMappingFrom
 * @see {@link module:WebGL/Constants}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants|WebGL Constants}
 * @private
 */


/**
 * An object containing the WebGL shader setter and setter argument datatype corresponding to a TypeSetterMappingFrom` value
 * @typedef {Object} TypeSetterMappingTo
 * @property {String} setter The name of a static setter method of either {@link ShaderAttributeSetters} or {@link ShaderUniformSetters}
 * @property {TypedArray} type The type of array to wrap data in before sending to the shader
 * @see TypeSetterMappingFrom
 * @private
 */


/**
 * A mapping of WebGL data types to WebGL setter functions
 * @type {{TypeSetterMappingFrom, TypeSetterMappingTo}}
 * @readonly
 * @private
 */
const ShaderTypeSetterMap = Object.freeze({
  [c.BOOL]                          : { setter: 'intVec1Setter',      type: Int32Array,     },
  [c.BOOL_VEC2]                     : { setter: 'intVec2Setter',      type: Int32Array,     },
  [c.BOOL_VEC3]                     : { setter: 'intVec3Setter',      type: Int32Array,     },
  [c.BOOL_VEC4]                     : { setter: 'intVec4Setter',      type: Int32Array,     },
  [c.INT]                           : { setter: 'intVec1Setter',      type: Int32Array,     },
  [c.INT_VEC2]                      : { setter: 'intVec2Setter',      type: Int32Array,     },
  [c.INT_VEC3]                      : { setter: 'intVec3Setter',      type: Int32Array,     },
  [c.INT_VEC4]                      : { setter: 'intVec4Setter',      type: Int32Array,     },
  [c.UNSIGNED_INT]                  : { setter: 'intVec1Setter',      type: Uint32Array,    },
  [c.UNSIGNED_INT_VEC2]             : { setter: 'intVec2Setter',      type: Uint32Array,    },
  [c.UNSIGNED_INT_VEC3]             : { setter: 'intVec3Setter',      type: Uint32Array,    },
  [c.UNSIGNED_INT_VEC4]             : { setter: 'intVec4Setter',      type: Uint32Array,    },
  [c.FLOAT]                         : { setter: 'floatVec1Setter',    type: Float32Array,   },
  [c.FLOAT_VEC2]                    : { setter: 'floatVec2Setter',    type: Float32Array,   },
  [c.FLOAT_VEC3]                    : { setter: 'floatVec3Setter',    type: Float32Array,   },
  [c.FLOAT_VEC4]                    : { setter: 'floatVec4Setter',    type: Float32Array,   },
  [c.FLOAT_MAT2]                    : { setter: 'floatMatrix2Setter', type: Float32Array,   },
  [c.FLOAT_MAT3]                    : { setter: 'floatMatrix3Setter', type: Float32Array,   },
  [c.FLOAT_MAT4]                    : { setter: 'floatMatrix4Setter', type: Float32Array,   },
})


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
 * @param {Array} values An array of values to sent to the shader
 * @see {@link ShaderAttributeSetters}
 * @see {@link ShaderUniformSetters}
 * @private
 */


/**
 * A generic callback signature for setting shader parameters
 * @callback ShaderParameterSetterCallback
 * @param {extenal:WebGL2RenderingContext} gl The WebGL rendering context
 * @param {Number[]} values The array of values to send to the shader
 * @public
 */


/**
 * A container of WebGL shader uniform setters.
 *
 * Available uniform setter names:
 * - `intVec1Setter`
 * - `intVec2Setter`
 * - `intVec3Setter`
 * - `intVec4Setter`
 * - `floatVec1Setter`
 * - `floatVec2Setter`
 * - `floatVec3Setter`
 * - `floatVec4Setter`
 * - `floatMatrix2Setter`
 * - `floatMatrix3Setter`
 * - `floatMatrix4Setter`
 *
 * @type {Object<ShaderParameterSetterName, ShaderParameterSetter>}
 * @readonly
 * @private
 */
const ShaderUniformSetters = Object.freeze({
  intVec1Setter      : (gl, location, values) => { gl.uniform1iv(location, values)              },
  intVec2Setter      : (gl, location, values) => { gl.uniform2iv(location, values)              },
  intVec3Setter      : (gl, location, values) => { gl.uniform3iv(location, values)              },
  intVec4Setter      : (gl, location, values) => { gl.uniform4iv(location, values)              },
  floatVec1Setter    : (gl, location, values) => { gl.uniform1fv(location, values)              },
  floatVec2Setter    : (gl, location, values) => { gl.uniform2fv(location, values)              },
  floatVec3Setter    : (gl, location, values) => { gl.uniform3fv(location, values)              },
  floatVec4Setter    : (gl, location, values) => { gl.uniform4fv(location, values)              },
  floatMatrix2Setter : (gl, location, values) => { gl.uniformMatrix2fv(location, false, values) },
  floatMatrix3Setter : (gl, location, values) => { gl.uniformMatrix3fv(location, false, values) },
  floatMatrix4Setter : (gl, location, values) => { gl.uniformMatrix4fv(location, false, values) },
})


/**
 * A container of WebGL shader attribute setters
 *
 * Available parameter setter names
 * - `floatVec1Setter`
 * - `floatVec2Setter`
 * - `floatVec3Setter`
 * - `floatVec4Setter`
 *
 * @type {Object<ShaderParameterSetterName, ShaderParameterSetter>}
 * @readonly
 * @private
 */
const ShaderAttributeSetters = Object.freeze({
  floatVec1Setter    : (gl, location, values) => { gl.vertexAttrib1fv(location, values)         },
  floatVec2Setter    : (gl, location, values) => { gl.vertexAttrib2fv(location, values)         },
  floatVec3Setter    : (gl, location, values) => { gl.vertexAttrib3fv(location, values)         },
  floatVec4Setter    : (gl, location, values) => { gl.vertexAttrib4fv(location, values)         },
})


/**
 * Returns true if the info object is a reserved or built-in attribute/uniform
 * @param {external:WebGLActiveInfo} info As returned from `gl.getActiveUniform` or `gl.getActiveAttrib`
 * @return {bool} true if attribute/uniform is reserved
 * @private
 */
 function isBuiltin(info)
 {
   return info.name.startsWith('gl_') || info.name.startsWith('webgl_')
 }


/**
 * Creates a shader parameter setter callback
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} setterInfo Information object as returned by WebGL.{getActiveUniform|getActiveAttrib}
 * @param {external:GLint|external:WebGLUniformLocation} location The location of a WebGLShader attribute, or uniform, as returned by WebGL.{getAttribLocation|getUniformLocation}, respectively
 * @param {ShaderParameterSetters|ShaderUniformSetters}
 * @returns {ShaderParameterSetterCallback} A shader parameter setter callback
 * @throws {ShaderTypeSetterError} Throws on unknown setter type info
 * @private
 */
function createShaderSetter(gl, setterInfo, location, shaderSetters)
{
  const typeInfo = ShaderTypeSetterMap[setterInfo.type] ?? throw new ShaderTypeSetterError(`Missing setter type info: ${setterInfo.type}`)
  const setter   = shaderSetters[typeInfo.setter]
  const Type     = typeInfo.type

  return (context, values) => setter(context, location, new Type(Array.from(values)))
}


/**
 * Finds all (`attribute` or `uniform`) parameters for the given `WebGLProgram` and returns an array of callbacks for setting them
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @param {SetterType} type The type of setter to create
 * @returns {ShaderParameterSetterCallback[]} An array of shader parameter setter callbacks
 * @throws {ShaderTypeSetterError} Throws on unknown setter types
 * @private
 */
function createShaderSetters(gl, program, type)
{
  const [paramType, paramGetter, paramLocationGetter, createShaderSetterMethod]
    = type === SetterType.UNIFORM   ? [gl.ACTIVE_UNIFORMS,   gl.getActiveUniform, gl.getUniformLocation, createShaderUniformSetter  ]
    : type === SetterType.ATTRIBUTE ? [gl.ACTIVE_ATTRIBUTES, gl.getActiveAttrib,  gl.getAttribLocation,  createShaderAttributeSetter]
    : throw new ShaderTypeSetterError(`unknown setter type ${type}`)

  const setters = {}
  const count   = gl.getProgramParameter(program, paramType)

  for (let index=0; index<count; index++)
  {
    const paramInfo = paramGetter.call(gl, program, index)
    const location  = paramLocationGetter.call(gl, program, paramInfo.name)

    if (isBuiltin(paramInfo) || location == -1) continue

    const name = paramInfo.name.endsWith('[0]')
               ? paramInfo.name.size(0, -3)
               : paramInfo.name

    setters[name] = createShaderSetterMethod(gl, paramInfo, location)
  }

  return setters
}


/**
 * Creates an returns a attribute setter callback
 * @function
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} attributeInfo
 * @param {external:GLint} location The location of the attribute as returned by `WebGL.getAttributeLocation`
 * @returns {ShaderParameterSetterCallback} A shader attribute setter callbacks
 * @private
 */
const createShaderAttributeSetter = (gl, attributeInfo, location) => createShaderSetter(gl, attributeInfo, location, ShaderAttributeSetters)


/**
 * Creates an returns a uniform setter callback
 * @function
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLActiveInfo} uniformInfo
 * @param {external:WebGLUniformLocation} location The location of the shader uniform as returned by `WebGL.getUniformLocation`
 * @returns {ShaderParameterSetterCallback} A shader uniform setter callbacks
 * @private
 */
 const createShaderUniformSetter = (gl, uniformInfo, location) => createShaderSetter(gl, uniformInfo, location, ShaderUniformSetters)


/**
 * Finds all attributes for the given `WebGLProgram` and returns an array of callbacks for setting them
 * @function
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @returns {ShaderParameterSetterCallback[]} An array of shader attribute setter callbacks
 */
export const createShaderAttributeSetters = (gl, program) => createShaderSetters(gl, program, SetterType.ATTRIBUTE)


/**
 * Finds all uniforms for the given `WebGLProgram` and returns an array of callbacks for setting them
 * @function
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @returns {ShaderParameterSetterCallback[]} An array of shader uniform setter callbacks
 */
export const createShaderUniformSetters = (gl, program) => createShaderSetters(gl, program, SetterType.UNIFORM)


/**
 * Takes an array of shader parameter setters and applies them to the given array of parameters
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {ShaderParameterSetterCallback[]} setters An array of callbacks as returned by `createShader[Attribute|Uniform]Setters`
 * @param {Number[]} values An array of values to be used to set the shader parameters (attributes or uniforms)
 */
export function setShaderParams(gl, setters, values)
{
  Object.entries(values).forEach(([key, val]) => {
    if (key in setters) {
      setters[key](gl, val)
    }
  })
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
