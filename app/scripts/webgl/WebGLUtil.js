import { MakeErrorType, MakeLogger } from '../Util'
import { TypeSetterMap, AttributeSetters, UniformSetters } from './WebGLTypeSetters'


/** @module WebGLUtil */

/**
 * A collection static WebGL helper methods
 * @exports WebGLUtil
 * @hideconstructor
 */
export default class WebGLUtil
{
  /**
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @returns {Boolean}
   */
  static needCanvasResize(gl)
  {
    return gl.canvas.width  !== gl.canvas.clientWidth
        || gl.canvas.height !== gl.canvas.clientHeight
  }

  /**
   * Resizes the canvas to fill the window
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  static resizeCanvas(gl) {
    gl.canvas.width  = gl.canvas.clientWidth
    gl.canvas.height = gl.canvas.clientHeight
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }

  /**
   * Convenience method for logging information about the rendering context
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  static logContextInfo(gl)
  {
    const attrs = gl.getContextAttributes() ?? throw WebGLError('failed to acquire context info')

    Log.info('canvas attributes')
    for (const [key, val] of Object.entries(attrs))
    {
      Log.info(`\t${key}: ${val}`)
    }
  }

  /**
   * Convenience method for mapping WebGL enum error values to strings
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @returns {String}
   */
  static getError(gl)
  {
    const err = gl.getError(gl)

    return err === gl.NO_ERROR      ? null
         : err === gl.INVALID_ENUM  ? 'INVALID_ENUM'
         : err === gl.INVALID_VALUE ? 'INVALID_VALUE'
         : err === gl.OUT_OF_MEMORY ? 'OUT_OF_MEMORY'
         : err === gl.CONTEXT_LOST  ? 'CONTEXT_LOST'
         : err
  }

  /**
   * Checks for WebGL errors and throws as `ErrorType` if any are found
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Type} ErrorType The type to throw as
   */
  static onErrorThrowAs(gl, ErrorType)
  {
    const e = this.getError(gl)
    if (e) {
      throw new ErrorType(e)
    }
  }

  /**
   * Returns true if attribute/uniform is a reserved/built-in
   *
   * Credit to greggman for this method. See {@link https://github.com/greggman/twgl.js/blob/0a44471ab91d068dae3ccc85f3054eeeb4c19a3a/src/programs.js#L865}.
   *
   * @param {WebGLActiveInfo} info As returned from `gl.getActiveUniform` or `gl.getActiveAttrib`
   * @return {bool} true if attribute/uniform is reserved
   */
  static isBuiltin(info)
  {
    return info.name.startsWith('gl_') || info.name.startsWith('webgl_')
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(WebGLUtil)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const WebGLUtilError = MakeErrorType(WebGLUtil)
