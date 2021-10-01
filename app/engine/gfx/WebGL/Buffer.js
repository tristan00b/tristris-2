import { MakeErrorType, MakeLogger } from "../../utilities"
import { onErrorThrowAs } from './utilities'

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
   * @type {external:WebGLBuffer}
   */
  get location()
  {
    return this._location
  }

  /**
   * Binds the buffer to `target`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  bind(gl, target)
  {
    gl.bindBuffer(target, this.location)
    onErrorThrowAs(gl, BufferError)
  }

  /**
   * Unbinds the buffer from `target`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  unbind(gl, target)
  {
    gl.bindBuffer(target, null)
    onErrorThrowAs(gl, BufferError)
  }

  /**
   * Queries for a the specified buffer parameter
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @param {Number} pname A GLenum specifying paramter to be retrieved
   * @throws {BufferError} Throws on encountering a WebGL error
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getBufferParameter}
   */
  getBufferParameter(gl, target, pname)
  {
    const result = gl.getBufferParameter(target, pname)
    onErrorThrowAs(gl, BufferError)
    return result
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {external:GLenum} usage Specifies the intended usage pattern of the data store
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  data(gl, target, data, usage)
  {
    gl.bufferData(target, data, usage)
    onErrorThrowAs(gl, BufferError)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @param {Number} offset The offset in bytes of the first byte to write the data to
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  subData(gl, target, offset, data)
  {
    gl.bufferSubData(target, offset, data)
    onErrorThrowAs(gl, BufferError)
  }

  /**
   * Deletes the `WebGLBuffer`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  destroy(gl)
  {
    gl.deleteBuffer(this.location)
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
