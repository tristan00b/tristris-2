import { MakeErrorType,
         MakeLogger     } from '../../utilities'
import { onErrorThrowAs } from './utilities'

/**
 * Provides an interface for WebGLRenderbuffer objects
 */
export class Renderbuffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._target   = gl.RENDERBUFFER
    this._location = gl.createRenderbuffer()
  }

  /**
   * Returns a reference to the internal WebGLRenderbuffer object
   * @type {external:WebGLTexture}
   * @readonly
   */
  get location()
  {
    return this._location
  }

  /**
   * Returns the bind point for this texture
   * @type {external:GLenum}
   */
  get target()
  {
    return this._target
  }

  /**
   * Always returns true; used to differentiate between texture objects
   * @type {Boolean}
   */
  get isRenderBuffer()
  {
    return true
  }

  /**
   * Initializes the buffer's internal data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} intlfmt Specifies the internal data format (see link for complete list of options)
   * @param {Number} width The width of the of the buffer in pixels
   * @param {Number} height The height of the buffer in pixels
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage}
   */
  setStorage(gl, intlfmt, width, height)
  {
    gl.renderbufferStorage(this.target, intlfmt, width, height)
  }

  /**
   * Binds the buffer to the `gl.RENDERBUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    gl.bindRenderbuffer(this.target, this.location)
  }

  /**
   * Unbinds the buffer from the `gl.RENDERBUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindRenderbuffer(this.target, null)
  }

  /**
   * Deletes the internal `WebGLRenderbuffer` object
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    gl.deleteRenderbuffer(this.location)
  }
}
