import { createShaderUniformSetters, createShaderAttributeSetters, setShaderParams } from './WebGL/ShaderTypeSetters'
import { MakeErrorType, MakeLogger } from '../utilities'
import * as WebGL from './WebGL/all'


/**
 * Provides an interface for compiling an interacting with WebGL shader programs
 */
export class ShaderProgram
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param  {...Array} shaders Arrays grouping shader type (e.g. `gl.VERTEX_SHADER`) followed by the corresponding GLGL source
   * @example
   * const shader = new ShaderProgram(gl,
   *   { type: gl.VERTEX_SHADER,   source: shaders.vsource },
   *   { type: gl.FRAGMENT_SHADER, source: shaders.fsource })
   */
  constructor(gl, ...shaders)
  {
    this.shaders = shaders.map(({ type, source }) => new WebGL.Shader(gl, type, source))

    this.program = new WebGL.Program(gl)
    this.program.attachShaders(gl, ...(this.shaders))
    this.program.linkProgram(gl)

    this.setters = {}
    this.setters.uniforms   = createShaderUniformSetters(gl, this.program.location)
    this.setters.attributes = createShaderAttributeSetters(gl, this.program.location)
  }

  /**
   * Returns the `WebGLProgram` location.
   * @type {WebGLProgram}
   * @readonly
   * @returns The `WebGLProgram` location
   */
  get location()
  {
    return this.program.location
  }

  /**
   * Sets the shader program as part of the current rendering state.
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    gl.useProgram(this.program.location)
  }

  /**
   * Removes the shader program from the current rendering state.
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unuse(gl)
  {
    gl.useProgram(null)
  }

  /**
   * Sets the values of active shader uniforms. Set uniforms persist until the next call to `setUniforms`, or until a next successful link operation on the `WebGLProgram` object
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol,(Number[]|Boolean[])>} uniforms An object containing keys matching names of shader uniforms to set, and corresponding values
   * @example
   * shader.setUniforms({
   *   u_viewMatrix       : camera.lookat,
   *   u_projectionMatrix : camera.projection,
   *   ...
   * })
   */
  setUniforms(gl, uniforms)
  {
    setShaderParams(gl, this.setters.uniforms, uniforms)
  }

  /**
   * Sets constant values for generic vertex attributes
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol,(Number[]|Boolean[])>} attributes
   * @example
   * shader.setAttributes({
   *   a_vertexColour : Colour.red,
   *   ...
   * })
   * @see For usage information, see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttrib|here}.
   */
  setAttributes(gl, attributes)
  {
    setShaderParams(gl, this.setters.attributes, attributes)
  }

  /**
   * Deletes the `WebGLProgram` and associated `WebGLShader` objects
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    this.shaders.forEach(s => s.destroy(gl))
    this.program.destroy(gl)
  }
}


/**
 * @private
 * @see {@link module:Utilities.MakeLogger}
 */
 var Log = MakeLogger(ShaderProgram)


 /**
  * @private
  * @see {@link module:Utilities.MakeErrorType}
  */
 const ShaderProgramError = MakeErrorType(ShaderProgram)
