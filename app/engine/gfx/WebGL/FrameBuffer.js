import { Buffer               } from './Buffer'
import { Texture2D            } from './Texture2D'
import { RenderBuffer         } from './RenderBuffer'
import { MakeConstEnumerator,
         MakeErrorType,
         MakeLogger           } from '../../utilities'
import { FRAMEBUFFER,
         READ_FRAMEBUFFER,
         DRAW_FRAMEBUFFER     } from './constants'
import { onErrorThrowAs       } from './utilities'



/**
 * @module WebGL/FrameBuffer
 */


/**
 * @private
 * @todo implement
 */
export const FrameBufferAttachmentType = MakeConstEnumerator('FrameBufferAttachmentType', [
  'COLOUR',
  'DEPTH',
  'STENCIL',
  'DEPTH_STENCIL'
])


/**
 * @private
 * @todo implement
 */
export const FrameBufferDataDir = MakeConstEnumerator('FrameBufferDataDir', {
  'READ_WRITE' : FRAMEBUFFER,
  'READ_ONLY'  : READ_FRAMEBUFFER,
  'WRITE_ONLY' : DRAW_FRAMEBUFFER
})


/**
 */
export class FrameBuffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} [target=gl.FRAMEBUFFER] The framebuffer's binding-point
   * @todo Use FrameBufferDataDir in place of target
   */
  constructor(gl, target)
  {
    this._location = gl.createFramebuffer()
    this._target   = target ?? gl.FRAMEBUFFER
  }

  /**
   * @type {external:WebGLFrameBuffer}
   */
  get location()
  {
    return this._location
  }

  /**
   * @type {external:WebGLFrameBuffer}
   */
  get target()
  {
    return this._target
  }

  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} bindpoint The attachment bindpoint (e.g. `gl.COLOR_ATTACHMENT0`)
   * @param {Texture2D|RenderBuffer} buffer
   * @param {Number} [level=0] Texture LOD; has no effect if `buffer` is an instance of RenderBuffer
   */
  setAttachment(gl, bindpoint, buffer, level=0)
  {
    if (buffer.isRenderBuffer)
    {
      gl.framebufferRenderbuffer(this.target, bindpoint, buffer.target, buffer.location)
    }
    else
    {
      gl.framebufferTexture2D(this.target, bindpoint, gl.TEXTURE_2D, buffer.location, level)
    }

    onErrorThrowAs(gl, FrameBufferError)
  }

  // /**
  //  *
  //  * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
  //  * @param {external:GLenum} bindpoint The attachment bindpoint (e.g. `gl.COLOR_ATTACHMENT0`)
  //  * @param {RenderBuffer} buffer
  //  */
  // attachRenderBuffer(gl, bindpoint, buffer)
  // {
  //   gl.framebufferRenderbuffer(this.target, bindpoint, buffer.target, buffer)
  //   onErrorThrowAs(gl, FrameBufferError)
  // }

  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @returns {external:GLenum} A value indicating the status of the frame buffer
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/checkFramebufferStatus}
   */
  getStatus(gl)
  {
    return gl.checkFramebufferStatus(this.target)
  }

  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  static getFrameBufferBinding(gl)
  {
    return gl.getParameter(gl.FRAMEBUFFER_BINDING)
  }

  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    gl.bindFramebuffer(this.target, this.location)
  }

  unbind(gl)
  {
    gl.bindFramebuffer(this.target, null)
  }

  delete(gl)
  {
    gl.deleteFramebuffer(this.location)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(FrameBuffer)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const FrameBufferError = MakeErrorType(FrameBuffer)
