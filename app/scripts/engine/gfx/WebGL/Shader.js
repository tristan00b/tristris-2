import { createUniformSetters, createAttributeSetters, setParams } from './ShaderTypeSetters'
import { MakeErrorType, MakeLogger } from "../../utilities"


/**
 * Interface for creating and and managing a shader, and associated paramters/uniforms
 */
export class Shader
{
  /**
   * Internally creates a WebGL shader and compiles it
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} type An enum specifying the shader's type (e.g. gl.VERTEX_SHADER)
   * @param {String} source The shader's source code
   * @throws {ShaderError} Throws on shader compilation failure
   */
  constructor(gl, type, source)
  {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    gl.getShaderParameter(shader, gl.COMPILE_STATUS) || do {
      const shaderType = type == gl.VERTEX_SHADER   ? 'VERTEX'
                       : type == gl.FRAGMENT_SHADER ? 'FRAGMENT'
                       : type == gl.COMPUTE_SHADER  ? 'COMPUTE'
                       : 'unknown'
      const shaderLog = gl.getShaderInfoLog(shader)

      throw new ShaderError(`${shaderType}_SHADER compilation failed:\n\t${shaderLog}`)
    }

    this._location = shader
  }

  /**
   * Returns a WebGL reference to the shader
   * @type {WebGLShader}
   * @readonly
   */
  get location()
  {
    return this._location
  }

  /**
   * Returns information about the shader
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} name The name of the shader parameter to retrieve
   * @returns {String}
   */
  getParameter(gl, name)
  {
    return gl.getShaderParameter(gl, this.location, name)
  }

  /**
   * Marks the WebGL shader for deletion, which is deleted when shader is no longer in use
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    gl.deleteShader(this.location)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(Shader)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const ShaderError = MakeErrorType(Shader)
