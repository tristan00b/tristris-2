import { Buffer         } from './Buffer'
import { onErrorThrowAs } from './utilities'
import { MakeErrorType,
         MakeLogger     } from '../../utilities'


/**
 * Provides an interface for WebGLTexture objects
 * @todo Look into WebGLSampler (as an alternative to WebGLTexture?)
 */
export class Texture
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._location = gl.createTexture()
  }

  /**
   * Returns a reference to the internal WebGLTexture object
   * @type {external:WebGLTexture}
   * @readonly
   */
  get location()
  {
    return this._location
  }

  /**
   * Binds the texture to a given target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. `gl.TEXTURE_2D`)
   */
  bind(gl, target)
  {
    gl.bindTexture(target, this.location)
    onErrorThrowAs(gl, TextureError)
  }

  /**
   * Unbinds the texture from the given target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. `gl.TEXTURE_2D`)
   */
  unbind(gl, target)
  {
    gl.bindTexture(target, null)
    onErrorThrowAs(gl, TextureError)
  }

  /**
   * Deletes the internal `WebGLTexture` object
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  delete(gl)
  {
    gl.deleteTexture(this.location)
  }

  /**
   * Initializes the texture's internal data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target Specifies the texture's binding point
   * @param  {...any} args see complete list {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D|here}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D}
   * @see {@link https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE}
   */
  static setData2D(gl, target, ...args)
  {
    gl.texImage2D(target, ...args)
  }

  /**
   * Generates a set of mipmaps for the texture (see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap})
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {*} target Specifies the texture's binding point
   */
  static generateMipmap(gl, target)
  {
    gl.generateMipmap(target)
  }

  /**
   * Gets the value for a given texture and parameter
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. `gl.TEXTURE_2D`)
   * @param {external:GLenum} pname The parameter to query (e.g. `gl.TEXTURE_MAG_FILTER`)
   */
  static getParamter(gl, target, pname)
  {
    gl.getTexParameter(target, pname)
  }

  /**
   * Sets a given texture parameter with an *floating-point* value
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. `gl.TEXTURE_2D`)
   * @param {external:GLenum} pname The parameter to set (e.g. `gl.TEXTURE_MIN_LOD`)
   * @param {Number} value The value with which to set the parameter
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter}
   */
  static setFloatParam(gl, target, pname, value)
  {
    gl.texParameterf(target, pname, value)
  }

  /**
   * Sets a given texture parameter with an *integer* value
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} target The binding point (e.g. `gl.TEXTURE_2D`)
   * @param {external:GLenum} pname The parameter to set (e.g. `gl.TEXTURE_MAX_LEVEL`)
   * @param {Number|external:GLEnum} value The value with which to set the parameter (N.B. some parameters,
   *   such as `gl.TEXTURE_MAG_FILTER`, take a value corresponding to a `GLenum`, such as `gl.LINEAR`)
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter}
   */
  static setIntegerParam(gl, target, pname, value)
  {
    gl.texParameteri(target, pname, value)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Texture)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 export const TextureError = MakeErrorType(Texture)
