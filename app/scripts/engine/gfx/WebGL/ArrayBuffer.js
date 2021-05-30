import { Buffer } from './Buffer'
import { MakeErrorType, MakeLogger } from '../../utilities'


/**
 * A specialization of WebGL.Buffer
 * @extends Buffer
 */
export class ArrayBuffer extends Buffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    super(gl)
  }

  /**
   * Binds the buffer to the gl.ARRAY_BUFFER target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    super.bind(gl, gl.ARRAY_BUFFER)
  }

  /**
   * Unbinds the buffer from the gl.ARRAY_BUFFER target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, gl.ARRAY_BUFFER)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {TypedArray|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {external:GLenum} usage Specifies the intended usage pattern of the data store
   */
  data(gl, data, usage)
  {
    super.data(gl, gl.ARRAY_BUFFER, data, usage)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(ArrayBuffer)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const ArrayBufferError = MakeErrorType(ArrayBuffer)
