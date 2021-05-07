import { MakeErrorType, MakeLogger } from '../Util'
import { WebGLBuffer } from './WebGLBuffer'


/**
 * A specialization of WebGLBuffer
 * @extends WebGLBuffer
 */
export class WebGLElementArrayBuffer extends WebGLBuffer
{
  /**
   * @constructor
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    super(gl)
  }

  /**
   * Binds the buffer to the gl.ELEMENT_ARRAY_BUFFER target
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    super.bind(gl, gl.ELEMENT_ARRAY_BUFFER)
  }

  /**
   * Unbinds the buffer from the gl.ELEMENT_ARRAY_BUFFER target
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, gl.ELEMENT_ARRAY_BUFFER)
  }

  /**
   * Creates and initializes the buffer's data store
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|null} data The data to copy to the data store. If `null`, a data store is still be created but will be uninitialized.
   * @param {GLenum} usage Specifies the intended usage pattern of the data store
   */
  data(gl, data, usage)
  {
    super.data(gl, gl.ELEMENT_ARRAY_BUFFER, data, usage)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(WebGLElementArrayBuffer)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const WebGLElementArrayBufferError = MakeErrorType(WebGLElementArrayBuffer)
