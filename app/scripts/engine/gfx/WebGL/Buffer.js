import { MakeErrorType, MakeLogger } from "../../utilities"
import { onErrorThrowAs } from './wrappers'

/**
 * An interface for storing data such as vertices or colors
 */
export class Buffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
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
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   */
  bind(gl, target)
  {
    gl.bindBuffer(target, this.location)
    onErrorThrowAs(gl, BufferError)
  }

  /**
   * Unbinds the buffer from `target`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindBuffer(type, null)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {external:GLenum} usage Specifies the intended usage pattern of the data store
   */
  data(gl, target, data, usage)
  {
    gl.bufferData(target, data, usage)
    onErrorThrowAs(gl, BufferError)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(Buffer)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const BufferError = MakeErrorType(Buffer)
