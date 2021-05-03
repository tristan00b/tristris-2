import { MakeErrorType, MakeLogger } from "../util"

/**
 * Interface for creating and and managing a shader, and associated paramters/uniforms
 */
export class WebGLShader
{
  /**
   * Internally creates a WebGL shader and compiles it
   * @constructor
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLenum} type An enum specifying the shader's type (e.g. gl.VERTEX_SHADER)
   * @param {String} source The shader's source code
   * @throws {WebGLShaderError}
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
                       : 'unknown' /* should not happen */
      const shaderLog = gl.getShaderInfoLog(shader)

      throw new WebGLShaderError(`${shaderType}_SHADER compilation failed:\n\t${shaderLog}`)
    }

    this._shaderId = shader
  }

  /**
   * Returns a WebGL reference to the shader
   * @type {WebGLShader}
   */
  get shaderId()
  {
    return this._shaderId
  }

  /**
   * Returns information about the shader
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} name The name of the shader parameter to retrieve
   * @returns {String}
   */
  getParameter(gl, name)
  {
    return gl.getShaderParameter(gl, this.shaderId, name)
  }

  /**
   * Marks the WebGL shader for deletion, which is deleted when shader is no longer in use.
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    gl.deleteShader(this.shaderId)
  }
}

/** @see {@link util.MakeLogger} */
const Log = MakeLogger(WebGLShader)

/** @see {@link util.MakeErrorType} */
const WebGLShaderError = MakeErrorType(WebGLShader)
