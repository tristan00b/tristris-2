import { Buffer               } from './Buffer'
import { MakeConstEnumerator,
         MakeErrorType,
         MakeLogger           } from "../../utilities"


const UniformBlockIndex = MakeConstEnumerator('UniformBlockIndex', [
  'MATRICES',
  'DIRECTIONAL_LIGHTS',
  'POINT_LIGHTS',
  'SPOT_LIGHTS',
])

/**
 * @property {Number} index The position of the uniform within the block
 * @property {Number} size The number of elements including STD140 padding
 * @property {Number} offset The number of elements from the buffer base includeing STD140 padding
 */
const BlockUniformIndex = Object.freeze({
  MODEL        : { index: 0, size: 16, offset:  0 },
  VIEW         : { index: 1, size: 16, offset: 16 },
  PROJECTION   : { index: 2, size: 16, offset: 48 },
  DIR_LIGHTS   : { index: 0, size:  8, offset:  0 },
  POINT_LIGHTS : { index: 0, size: 12, offset:  0 },
  SPOT_LIGHTS  : { index: 0, size: 13, offset:  0 },
})


/**
 * A specialization of WebGL/Buffer for storing uniform block data
 * @extends Buffer
 */
export class UniformBuffer extends Buffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    super(gl)
  }

  getParameter(gl, pname)
  {
    return super.getBufferParameter(gl, gl.UNIFORM_BUFFER, pname)
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
   * Binds the buffer to the `gl.UNIFORM_BUFFER` target and a given bind point (index)
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} bindPoint A nonnegative integer, less than or equal to `gl.MAX_UNIFORM_BUFFER_BINDINGS - 1`
   */
  bindBase(gl, bindPoint)
  {
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindPoint, this.location)
  }

  /**
   * Binds a range of the buffer to the `gl.UNIFORM_BUFFER` target and a given bind point (index)
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} bindPoint A nonnegative integer, less than or equal to `gl.MAX_UNIFORM_BUFFER_BINDINGS - 1`
   * @param {Number} offset The starting offset in bytes
   * @param {Number} size The number of bytes to bind
   */
  bindRange(gl, bindPoint, offset, size)
  {
    gl.bindBufferRange(gl.UNIFORM_BUFFER, bindPoint, this.location, offset, size)
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
   * The buffer's bind point (index)
   * @type {Number}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindBufferBase}
   * @see {@link https://www.khronos.org/opengl/wiki/Uniform_Buffer_Object}
   */
  get bindPoint()
  {
    return this._bindPoint
  }

  set bindPoint(bindPoint)
  {
    this._bindPoint = bindPoint
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
