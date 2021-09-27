import { loadImage      } from '../../utilities'
import { MakeErrorType,
         MakeLogger     } from '../../utilities'
import { Texture        } from './Texture'


/**
 * Provides an interface for 2D WebGLTexture objects
 */
export class Texture2D extends Texture
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} [target=gl.TEXTURE_2D] Specifies the texture's bind point (the list of possible values
   *   corresponds to those listed for `target`
   *   {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D|here})
   */
  constructor(gl, target)
  {
    super(gl)
    this._target = target ?? gl.TEXTURE_2D
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
   * Binds the texture to the `gl.TEXTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    super.bind(gl, this.target)
  }

  /**
   * Unbinds the texture from the `gl.TEXUTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, this.target)
  }

  /**
   * Initializes the 2D texture's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLint} level The level of detail (level n is the nth mipmap, n=0 is the base mimmap)
   * @param {external:GLenum} intlfmt Specifies the colour format for the texture (see links for complete list)
   * @param {external:GLsizei} width The width of the texture image
   * @param {external:GLsizei} height The height of the texture image
   * @param {external:GLenum} fmt Specifies the format of the pixel data source (see links for complete list)
   * @param {external:GLenum} type Specifies the data type of the pixel data (see links for complete list)
   * @param {*|null} data The pixel data source (see MDN link for complete list of types)
   * @param {Boolean} [flipY=true] Flips the source data along its vertical axis if true
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D}
   * @see {@link https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE}
   */
  setData(gl, level, intlfmt, width, height, fmt, type, data, flipY)
  {
    super.setData2D(gl, this.target, level, intlfmt, width, height, fmt, type, data, flipY)
  }

  /**
   * Sets a given texture parameter with an *floating-point* value
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} pname The parameter to set (e.g. `gl.TEXTURE_MIN_LOD`)
   * @param {Number} value The value with which to set the parameter
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter}
   */
  setFloatParam(gl, pname, value)
  {
    Texture.setFloatParam(gl, this.target, pname, value)
  }

  /**
   * Sets a given texture parameter with an *integer* value
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {external:GLenum} pname The parameter to set (e.g. `gl.TEXTURE_MAX_LEVEL`)
   * @param {Number|external:GLEnum} value The value with which to set the parameter (N.B. some parameters,
   *   such as `gl.TEXTURE_MAG_FILTER`, take a value corresponding to a `GLenum`, such as `gl.LINEAR`)
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter}
   */
  setIntegerParam(gl, pname, value)
  {
    Texture.setIntegerParam(gl, this.target, pname, value)
  }

  /**
   * Generates a set of mipmaps for the texture (see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap})
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  generateMipmap(gl)
  {
    Texture.generateMipmap(gl, this.target)
  }

  /**
   * Fetches the data located at `url` and uses it to create and initalize a new `Texture2D` instance
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} url The location of the data to load
   * @returns {Texture2D}
   * @todo remove to avoid resetting texter parameters after loading image data
   */
  static fromURL(gl, url)
  {
    const texture = new Texture2D(gl)

    // pre-initialize with a 1-pixel magenta texture
    texture.bind(gl)
    texture.setData(gl, 0, gl.RGBA, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]), false)
    texture.unbind(gl)

    loadImage(url, (event) => {
      const { width, height } = event.target
      texture.bind(gl)
      texture.setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      texture.setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_S,     gl.REPEAT)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_T,     gl.REPEAT)
      texture.setData(gl, 0, gl.RGBA, width, height, gl.RGBA, gl.UNSIGNED_BYTE, event.target)
      texture.generateMipmap(gl)
      texture.unbind(gl)
    })

    return texture
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Texture2D)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 export const Texture2DError = MakeErrorType(Texture2D)
