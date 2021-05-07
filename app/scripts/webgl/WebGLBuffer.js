import { MakeErrorType, MakeLogger } from "../Util";
import WebGLUtil from "./WebGLUtil";


/**
 * An interface for storing data such as vertices or colors
 */
export class WebGLBuffer
{
  /**
   * @constructor
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._location = gl.createBuffer()
  }

  /**
   * Returns a WebGL reference to the buffer
   * @type {WebGLBuffer}
   */
  get location()
  {
    return this._location
  }

  /**
   * Binds the buffer to `target`
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   */
  bind(gl, target)
  {
    gl.bindBuffer(target, this.location)
    WebGLUtil.onErrorThrowAs(gl, WebGLBufferError)
  }

  /**
   * Unbinds the buffer from `target`
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindBuffer(type, null)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {GLenum} usage Specifies the intended usage pattern of the data store
   */
  data(gl, target, data, usage)
  {
    gl.bufferData(target, data, usage)
    WebGLUtil.onErrorThrowAs(gl, WebGLBufferError)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(WebGLBuffer)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const WebGLBufferError = MakeErrorType(WebGLBuffer)
