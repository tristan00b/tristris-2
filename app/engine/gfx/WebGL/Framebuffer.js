import { MakeConstEnumerator,
         MakeErrorType,
         MakeLogger                } from '../../utilities'
import { Buffer,
         Renderbuffer,
         Texture2D                 } from './all'
import { COLOR_ATTACHMENT0,
         DEPTH_ATTACHMENT,
         DEPTH_STENCIL_ATTACHMENT,
         DRAW_FRAMEBUFFER,
         FRAMEBUFFER,
         MAX_COLOR_ATTACHMENTS,
         READ_FRAMEBUFFER,
         RENDERBUFFER,
         STENCIL_ATTACHMENT        } from './constants'
import { onErrorThrowAs            } from './utilities'


/**
 * @module Engine/gfx/Framebuffer
 */

/**
 * Enumerates Framebuffer attachment types
 * @enum {Number}
 * @property {Number} COLOUR        Corresponding to `gl.COLOR_ATTACHMENT0        = 0x8CE0`
 * @property {Number} DEPTH         Corresponding to `gl.DEPTH_ATTACHMENT         = 0x8D00`
 * @property {Number} DEPTH_STENCIL Corresponding to `gl.DEPTH_STENCIL_ATTACHMENT = 0x821A`
 * @property {Number} STENCIL       Corresponding to `gl.STENCIL_ATTACHMENT       = 0x8D20`
 * @property {Number} RENDERBUFFER  Corresponding to `gl.RENDERBUFFER             = 0x8D41`
 * @readonly
 */
export const FramebufferAttachmentType = MakeConstEnumerator('FramebufferAttachmentType', {
  COLOUR        : COLOR_ATTACHMENT0,
  DEPTH         : DEPTH_ATTACHMENT,
  DEPTH_STENCIL : DEPTH_STENCIL_ATTACHMENT,
  STENCIL       : STENCIL_ATTACHMENT,
  RENDERBUFFER  : RENDERBUFFER,
})


/**
 * Enumerates the possible data directions for framebuffer attachments
 * @enum {Number}
 * @property {Number} READ_WRITE
 * @property {Number} READ_ONLY
 * @property {Number} WRITE_ONLY
 * @readonly
 */
 export const FramebufferDataDirection = MakeConstEnumerator('FrameBufferDataDir', {
  'READ_WRITE' : FRAMEBUFFER,
  'READ_ONLY'  : READ_FRAMEBUFFER,
  'WRITE_ONLY' : DRAW_FRAMEBUFFER
})


/**
 * Provides a specification for an individual framebuffer attachment, where the data direction determines whether the
 * storage backing will be a 2D texture (`direction=READ_ONLY|READ_WRITE`), or a renderbuffer (`direction=WRITE_ONLY`).
 * In the case that the data direction is set to `WRITE_ONLY`, the parameters indicated as optional will be unused.
 * Otherwise, they are required.
 *
 * @typedef FramebufferAttachmentSpec
 * @property {FramebufferAttachmentType} type Specifies the attachement target
 * @property {FramebufferDataDirection} direction Specifies whether the attachment backing will be read from and/or written to
 * @property {external:GLenum} datafmt Specifies the format of storage backing data
 * @property {external:GLenum} [pixelfmt] Specifies the format of storage backing's pixel data
 * @property {external:GLenum} [datatype] Specifies the data type of the storage backing
 * @property {external:GLenum} [minfilter] Specifies the minification filter of storage backing
 * @property {external:GLenum} [magfilter] Specifies the magmification filter of storage backing
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D}
 * @see {@link https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE}
 *
 * @example
 * // This spec will produce a Texture2D backing:
 * const colourAttachmentSpec = {
 *   type      : FramebufferAttachmentType.COLOUR+0,
 *   direction : FramebufferDataDirection.READ_WRITE,
 *   datafmt   : gl.RGBA16F,
 *   pixelfmt  : gl.RGBA,
 *   datatype  : gl.FLOAT,
 *   minfilter : gl.LINEAR,
 *   magfilter : gl.LINEAR,
 * }
 *
 * // This spec will produce a Renderbuffer backing:
 * const depthAttachmentSpec = {
 *   type      : FramebufferAttachmentType.DEPTH,
 *   direction : FramebufferDataDirection.WRITE_ONLY,
 *   datafmt   : gl.DEPTH_COMPONENT24,
 * }
 */


/**
 * Provides an interface for WebGLFramebuffer objects
 */
export class Framebuffer
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {...FramebufferAttachmentSpec} attachmentSpecs One or more attachment specifications, up to max number of
   *   framebuffers--system dependent. Including additional specs will result in a warning logged to the console,
   *   indicating the number of specs received and the maximum allowable for the local system.
   */
  constructor(gl, ...attachmentSpecs)
  {
    this._location    = gl.createFramebuffer()
    this._attachments = attachmentSpecs.map(spec => Object.assign({}, spec))

    this.bind(gl)
    configureAttachments(gl, this, this._attachments)
    throwOnIncompleteStatus(gl, this, _ => this.destroy(gl))
    this.unbind(gl)
  }

  /**
   * Returns a reference to the internal WebGLFramebuffer object
   * @type {external:WebGLFrameBuffer}
   * @readonly
   */
  get location()
  {
    return this._location
  }

  /**
   * Returns the bind point for this framebuffer
   * @type {external:GLenum}
   * @readonly
   */
  get target()
  {
    return FRAMEBUFFER
  }

  /**
   * Binds the framebuffer to the `gl.FRAMEBUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    gl.bindFramebuffer(this.target, this.location)
  }

  /**
   * Unbinds the framebuffer from the `gl.FRAMEBUFFER` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindFramebuffer(this.target, null)
  }

  /**
   * Binds the texture associated with the attachment at index `index`, allowing it to be read while, for example,
   * rendering to another framebuffer
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} [index=0] The index of the attachment whose texture is to be bound
   */
  bindTexture(gl, index=0)
  {
    if (this._attachments[index].buffer.isRenderbuffer)
      return

    this._attachments[index].buffer.bind(gl)
  }

  /**
   * Unbinds the texture associated with the attachment at index `index`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} [index=0] The index of the attachment whose texture is to be unbound
   */
  unbindTexture(gl, index=0)
  {
    if (this._attachments[index].buffer.isRenderbuffer)
      return

    this._attachments[index].buffer.unbind(gl)
  }

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
   * Attaches a texture, or renderbuffer, to a given bindpoint at a given level-of-detail
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} bindpoint The attachment bindpoint (e.g. `gl.COLOR_ATTACHMENT0`)
   * @param {Texture2D|RenderBuffer} buffer The texture of renderbuffer to attach
   * @param {Number} [level=0] Texture LOD; has no effect if `buffer` is an instance of `Renderbuffer`
   */
  setAttachment(gl, bindpoint, buffer, level=0)
  {
    if (buffer.isRenderbuffer)
      gl.framebufferRenderbuffer(this.target, bindpoint, gl.RENDERBUFFER, buffer.location)
    else
      gl.framebufferTexture2D(this.target, bindpoint, gl.TEXTURE_2D, buffer.location, level)

    onErrorThrowAs(gl, FramebufferError, `failed to attach buffer`)
  }

  /**
   * While the framebuffer is bound, sets the buffers to draw to
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Array.<external:GLenum>} buffers The list of buffers to draw to
   * @throws {FramebufferError} Throws on attempting to set an invalid list of draw buffers
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawBuffers}
   */
  setDrawbuffers(gl, buffers)
  {
    gl.drawBuffers(buffers)
    onErrorThrowAs(gl, FramebufferError, `failed to set draw buffers`)
  }

  /**
   * Resizes the framebuffers attachments to a given width and height
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} width The new width for the framebuffer
   * @param {Number} height The new height for the framebuffer
   */
  resize(gl, width, height)
  {
    this._attachments.map(a => {
      a.buffer.bind(gl)

      if (a.buffer.isRenderbuffer)
        a.buffer.setStorage(gl, a.datafmt, width, height)
      else
        a.buffer.setData(gl, 0, a.datafmt, width, height, a.pixelfmt, a.datatype, null)

      a.buffer.unbind(gl)
    })
  }

  /**
   * Unbinds the framebuffer and its attachments and deleting their internal WebGL objects
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    this.unbind(gl)

    this._attachments.map(attachment => attachment.buffer).forEach(buffer => {
      buffer.unbind(gl)
      buffer.destroy(gl)
    })

    gl.deleteFramebuffer(this.location)
  }

  /**
   * Retrieves the currently bound framebuffer, or null, which corresponds to the default framebuffer
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @returns {external:WebGLFramebuffer|null}
   */
  static getFrameBufferBinding(gl)
  {
    return gl.getParameter(gl.FRAMEBUFFER_BINDING)
  }
}


/**
 * Configures a given framebuffer's attachments given a list of attachment specifications
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Framebuffer} framebuffer
 * @param {Array} attachments
 * @private
 */
function configureAttachments(gl, framebuffer, attachments)
{
  const maxAttachmentCount = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)

  if (attachments.length > maxAttachmentCount)
    Log.warn(`too many attachments (got: ${attachments.length}, max: ${maxAttachmentCount})`)

  const [ width, height ] = [ gl.canvas.clientWidth, gl.canvas.clientHeight ]

  attachments.forEach((spec, index) => {

    if (index >= maxAttachmentCount) return

    spec.buffer = spec.direction === FramebufferDataDirection.WRITE_ONLY
      ? Renderbuffer.fromSpec(gl, spec, width, height)
      : Texture2D.fromSpec(gl, spec, width, height)

    spec.buffer.bind(gl)
    framebuffer.setAttachment(gl, spec.type, spec.buffer)
    spec.buffer.unbind(gl)
  })
}


/**
 * Checks a given framebuffer for completeness, calling a cleanup callback and throwing an error if the framebuffer is
 * incomplete.
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Framebuffer} buffer The framebuffer to check
 * @param {Function} cleanupCallback A 0-argument callback for handling cleanup if the buffer is incomplete
 * @private
 */
function throwOnIncompleteStatus(gl, buffer, cleanupCallback)
{
  try {
    const status = buffer.getStatus(gl)
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new FramebufferError(`buffer incomplete (status: ${(status).toString(16).toUpperCase()})`)
    }
  } catch(e) {
    cleanupCallback?.()
    throw e
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(Framebuffer)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
const FramebufferError = MakeErrorType(Framebuffer)
