import { MakeErrorType, MakeLogger } from './Util'
import * as WebGL from './WebGL'

export class ShaderProgram
{
  constructor(gl, ...shaders)
  {
    this.shaders = shaders.map(([type, source]) => new WebGL.Shader(gl, type, source))
    this.program = new WebGL.Program(gl)
    this.program.attachShaders(gl, ...(this.shaders))
    this.program.linkProgram(gl)

    this.attribute = {
      position: gl.getAttribLocation(this.program.location, 'vertex_position')
    }
    this.uniform = {
      modelMatrix:      gl.getUniformLocation(this.program.location, 'model_matrix'),
      viewMatrix:       gl.getUniformLocation(this.program.location, 'view_matrix'),
      projectionMatrix: gl.getUniformLocation(this.program.location, 'projection_matrix'),
    }
  }

  use(gl)
  {
    gl.useProgram(this.program.location)
  }

  unuse(gl)
  {
    gl.useProgram(null)
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
