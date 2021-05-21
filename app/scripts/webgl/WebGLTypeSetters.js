import * as gl from './constants/common'
import WebGLUtil from './WebGLUtil'


const SetterType = Object.freeze({
  UNIFORM    : 0,
  ATTRIBUTE  : 1
})


const TypeSetterMap = Object.freeze({
  [gl.BOOL]                          : { setter: 'intVec1Setter',      type: Int32Array,     },
  [gl.BOOL_VEC2]                     : { setter: 'intVec2Setter',      type: Int32Array,     },
  [gl.BOOL_VEC3]                     : { setter: 'intVec3Setter',      type: Int32Array,     },
  [gl.BOOL_VEC4]                     : { setter: 'intVec4Setter',      type: Int32Array,     },
  [gl.INT]                           : { setter: 'intVec1Setter',      type: Int32Array,     },
  [gl.INT_VEC2]                      : { setter: 'intVec2Setter',      type: Int32Array,     },
  [gl.INT_VEC3]                      : { setter: 'intVec3Setter',      type: Int32Array,     },
  [gl.INT_VEC4]                      : { setter: 'intVec4Setter',      type: Int32Array,     },
  [gl.UNSIGNED_INT]                  : { setter: 'intVec1Setter',      type: Uint32Array,    },
  [gl.UNSIGNED_INT_VEC2]             : { setter: 'intVec2Setter',      type: Uint32Array,    },
  [gl.UNSIGNED_INT_VEC3]             : { setter: 'intVec3Setter',      type: Uint32Array,    },
  [gl.UNSIGNED_INT_VEC4]             : { setter: 'intVec4Setter',      type: Uint32Array,    },
  [gl.FLOAT]                         : { setter: 'floatVec1Setter',    type: Float32Array,   },
  [gl.FLOAT_VEC2]                    : { setter: 'floatVec2Setter',    type: Float32Array,   },
  [gl.FLOAT_VEC3]                    : { setter: 'floatVec3Setter',    type: Float32Array,   },
  [gl.FLOAT_VEC4]                    : { setter: 'floatVec4Setter',    type: Float32Array,   },
  [gl.FLOAT_MAT2]                    : { setter: 'floatMatrix2Setter', type: Float32Array,   },
  [gl.FLOAT_MAT3]                    : { setter: 'floatMatrix3Setter', type: Float32Array,   },
  [gl.FLOAT_MAT4]                    : { setter: 'floatMatrix4Setter', type: Float32Array,   },
})


class UniformSetters
{
  static intVec1Setter      (gl, location, args) { gl.uniform1iv(location, args)              }
  static intVec2Setter      (gl, location, args) { gl.uniform2iv(location, args)              }
  static intVec3Setter      (gl, location, args) { gl.uniform3iv(location, args)              }
  static intVec4Setter      (gl, location, args) { gl.uniform4iv(location, args)              }
  static floatVec1Setter    (gl, location, args) { gl.uniform1fv(location, args)              }
  static floatVec2Setter    (gl, location, args) { gl.uniform2fv(location, args)              }
  static floatVec3Setter    (gl, location, args) { gl.uniform3fv(location, args)              }
  static floatVec4Setter    (gl, location, args) { gl.uniform4fv(location, args)              }
  static floatMatrix2Setter (gl, location, args) { gl.uniformMatrix2fv(location, false, args) }
  static floatMatrix3Setter (gl, location, args) { gl.uniformMatrix3fv(location, false, args) }
  static floatMatrix4Setter (gl, location, args) { gl.uniformMatrix4fv(location, false, args) }
}


class AttributeSetters
{
  static floatVec1Setter    (gl, location, args) { gl.vertexAttrib1fv(location, args)         }
  static floatVec2Setter    (gl, location, args) { gl.vertexAttrib2fv(location, args)         }
  static floatVec3Setter    (gl, location, args) { gl.vertexAttrib3fv(location, args)         }
  static floatVec4Setter    (gl, location, args) { gl.vertexAttrib4fv(location, args)         }
}


function createSetter(gl, setterInfo, location, setters)
{
  const typeInfo = TypeSetterMap[setterInfo.type] ?? throw new WebGLUtilError(`Mising setter type: ${setterInfo.type}`)
  const setter   = setters[typeInfo.setter]
  const Type     = typeInfo.type

  return (values) => setter(gl, location, new Type(Array.from(values)))
}


function createSetters(gl, program, type)
{
  const [paramType, paramGetter, paramLocationGetter, createSettersMethod]
    = type === SetterType.UNIFORM   ? [gl.ACTIVE_UNIFORMS,   gl.getActiveUniform, gl.getUniformLocation, createUniformSetter  ]
    : type === SetterType.ATTRIBUTE ? [gl.ACTIVE_ATTRIBUTES, gl.getActiveAttrib,  gl.getAttribLocation,  createAttributeSetter]
    : throw new WebGLUtilError(`unknown setter type ${type}`)

  const setters = {}
  const count   = gl.getProgramParameter(program, paramType)

  for (let index=0; index<count; index++)
  {
    const paramInfo = paramGetter.call(gl, program, index)
    const location  = paramLocationGetter.call(gl, program, paramInfo.name)

    if (WebGLUtil.isBuiltin(paramInfo) || !location) continue

    const name = paramInfo.name.endsWith('[0]')
               ? paramInfo.name.size(0, -3)
               : paramInfo.name

    setters[name] = createSettersMethod(gl, paramInfo, location)
  }

  return setters
}


const createAttributeSetter = (gl, attributeInfo, location) => createSetter(gl, attributeInfo, location, AttributeSetters)

const createAttributeSetters = (gl, program) => createSetters(gl, program, SetterType.ATTRIBUTE)


const createUniformSetter  = (gl, uniformInfo, location) => createSetter(gl, uniformInfo, location, UniformSetters)

const createUniformSetters = (gl, program) => createSetters(gl, program, SetterType.UNIFORM)


function setParams(setters, params)
{
  Object.entries(params).forEach(([key, val]) => {
    if (key in setters) {
      setters[key](val)
    }
  })
}


export {
  createAttributeSetters,
  createUniformSetters,
  setParams
}
