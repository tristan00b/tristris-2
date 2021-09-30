import { Buffer         } from './Buffer'
import { MakeErrorType,
         MakeLogger     } from "../../utilities"


/**
 * A specialization of WebGL/Buffer for storing uniform block data
 * @extends Buffer
 */
export class UniformBuffer extends Buffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} size a positive integer specifying the size of the buffer (in bytes) to instantiate
   * @throws {UniformBufferError} Throws when `size` is less than or equal to zero
   */
  constructor(gl, size)
  {
    super(gl)
    if (size && size > 0) {
      this.bind(gl)
      gl.bufferData(gl.UNIFORM_BUFFER, size, gl.DYNAMIC_DRAW)
      this._size = this.getBufferParameter(gl, gl.UNIFORM_BUFFER, gl.BUFFER_SIZE)
      this.unbind(gl)
    }
    else {
      throw new UniformBufferError(`buffer size required for instantiation (got: ${size})`)
    }
  }

  /**
   * Reports the size of the buffer in bytes
   * @type {Number}
   */
  get size()
  {
    return this._size
  }

  /**
   * Binds the buffer to the `gl.UNIFORM_BUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. gl.ARRAY_BUFFER)
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  bind(gl)
  {
    super.bind(gl, gl.UNIFORM_BUFFER)
  }

  /**
   * Unbinds the buffer from the `gl.UNIFORM_BUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, gl.UNIFORM_BUFFER)
  }

  /**
   * Sets the buffer's bind point (index)
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} bindPoint A nonnegative integer less than or equal to `gl.MAX_UNIFORM_BUFFER_BINDINGS - 1`
   *   (Implementation dependent)
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindBufferBase}
   * @see {@link https://www.khronos.org/opengl/wiki/Uniform_Buffer_Object}
   *
   */
  setBindPoint(gl, bindPoint)
  {
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindPoint, this.location)
    this._bindPoint = bindPoint
  }

  /**
   * Reports the buffer's bind point, if set
   * @type {Number}
   */
  get bindPoint()
  {
    return this._bindPoint
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {ArrayBuffer|Number|null} dataOrSize The data to copy to the buffer's data store, the size (in bytes) of the
   *   data store to be allocated, or, `null`, which will result in the data store being created but left uninitialized.
   * @param {Number} [usage=gl.STATIC_DRAW]  Specifies the intended usage pattern of the data store
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  data(gl, dataOrSize, usage)
  {
    super.data(gl, gl.UNIFORM_BUFFER, dataOrSize, usage ?? gl.STATIC_DRAW)
  }

  /**
   * Updates a subset of the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} offset The offset in bytes of the first byte to write the data to
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a
   *   data store is still be created but will be uninitialized.
   * @throws {BufferError} Throws on encountering a WebGL error
   */
  subData(gl, offset, data)
  {
    super.subData(gl, gl.UNIFORM_BUFFER, offset, data)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(UniformBuffer)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const UniformBufferError = MakeErrorType(UniformBuffer)
