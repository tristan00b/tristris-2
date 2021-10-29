import { MakeErrorType, MakeLogger } from '../../utilities'
import { ElementArrayBuffer } from './ElementArrayBuffer'


/**
 * A collection static WebGL helper methods
 * @module WebGL/Utilities
 */


/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @returns {Boolean}
 */
export function needCanvasResize(gl)
{
  return gl.canvas.width  !== gl.canvas.clientWidth
      || gl.canvas.height !== gl.canvas.clientHeight
}


/**
 * Resizes the canvas to fill the window
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 */
export function resizeCanvas(gl)
{
  gl.canvas.width  = gl.canvas.clientWidth
  gl.canvas.height = gl.canvas.clientHeight
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}


/**
 * Convenience method for logging information about the rendering context
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @throws Throws on failure to acquire WebGL context attributes
 */
export function logContextInfo(gl)
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
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @returns {String}
 */
export function getError(gl)
{
  const err = gl.getError(gl)

  return err === gl.NO_ERROR           ? null
       : err === gl.INVALID_ENUM       ? 'INVALID_ENUM'
       : err === gl.INVALID_OPERATION  ? 'INVALID_OPERATION'
       : err === gl.INVALID_VALUE      ? 'INVALID_VALUE'
       : err === gl.OUT_OF_MEMORY      ? 'OUT_OF_MEMORY'
       : err === gl.CONTEXT_LOST_WEBGL ? 'CONTEXT_LOST'
       : err
}


/**
 * Checks for WebGL errors and throws as `ErrorType` if any are found
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Type} ErrorType The type to throw as
 * @param {String} [msg] An optional message for additional context
 * @throws {*} Throws instance of `ErrorType` when a WebGL error has occured
 */
export function onErrorThrowAs(gl, ErrorType, msg)
{
  const err = getError(gl)

  if (err)
    throw new ErrorType(msg ? `${msg} ` : '' + `[${err}]`)
}


/**
 * Only for logging and throwing errors
 * @private
 */
class WebGLUtil { static name = "WebGL.Util" }


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(WebGLUtil)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
export const WebGLUtilError = MakeErrorType(WebGLUtil)
