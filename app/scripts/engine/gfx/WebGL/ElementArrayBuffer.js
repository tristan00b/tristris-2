import { MakeErrorType, MakeLogger } from '../../utilities'
import { Buffer } from './Buffer'


/**
 * A specialization of WebGLBuffer
 * @extends WebGL.Buffer
 */
export class ElementArrayBuffer extends Buffer
{
  /**
   * @constructor
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    super(gl)
  }

  /**
   * Binds the buffer to the gl.ELEMENT_ARRAY_BUFFER target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    super.bind(gl, gl.ELEMENT_ARRAY_BUFFER)
  }

  /**
   * Unbinds the buffer from the gl.ELEMENT_ARRAY_BUFFER target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, gl.ELEMENT_ARRAY_BUFFER)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {external:GLenum} usage Specifies the intended usage pattern of the data store
   */
  data(gl, data, usage)
  {
    super.data(gl, gl.ELEMENT_ARRAY_BUFFER, data, usage)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(ElementArrayBuffer)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const ElementArrayBufferError = MakeErrorType(ElementArrayBuffer)
