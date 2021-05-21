import { MakeErrorType, MakeLogger } from './Util'
import { createUniformSetters, createAttributeSetters, setParams } from './webgl/WebGLTypeSetters'
import * as WebGL from './WebGL'
import WebGLUtil from './webgl/WebGLUtil'

export class ShaderProgram
{
  constructor(gl, ...shaders)
  {
    this.shaders = shaders.map(([type, source]) => new WebGL.Shader(gl, type, source))
    this.program = new WebGL.Program(gl)
    this.program.attachShaders(gl, ...(this.shaders))
    this.program.linkProgram(gl)

    this.attributes = {
      position: gl.getAttribLocation(this.program.location, 'vertex_position')
    }

    this.setters = {}
    this.setters.uniforms   = createUniformSetters(gl, this.program.location)
    this.setters.attributes = createAttributeSetters(gl, this.program.location)
  }

  get location()
  {
    return this.program.location
  }

  use(gl)
  {
    gl.useProgram(this.program.location)
  }

  unuse(gl)
  {
    gl.useProgram(null)
  }

  setUniforms(uniforms)
  {
    setParams(this.setters.uniforms, uniforms)
  }

  setAttributes(attributes)
  {
    setParams(this.setters.attributes, attributes)
  }

  destroy(gl)
  {
    this.program.destroy(gl)
    this.shaders.forEach(s => s.destroy(gl))
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
 var Log = MakeLogger(ShaderProgram)


 /**
  * @private
  * @see {@link util.MakeErrorType}
  */
 const ShaderProgramError = MakeErrorType(ShaderProgram)
