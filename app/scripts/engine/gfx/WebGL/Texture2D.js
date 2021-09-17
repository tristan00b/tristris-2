import { Texture   } from './Texture'
import { loadImage } from '../../utilities'


/**
 * Provids an interface for 2D WebGLTexture objects
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
   * Initializes the texture's data store
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {...any} args The arguments as they would be provided to
   * {@link Texture.setData2D} ***except*** for the `target` argument
   */
  setData(gl, ...args)
  {
    Texture.setData2D(gl, this.target, ...args)
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
   * @returns
   */
  static fromURL(gl, url)
  {
    const texture = new Texture2D(gl)

    const image = loadImage(url, (event) => {
      texture.bind(gl)
      texture.setData(gl, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, event.target)
      texture.generateMipmap(gl)
      texture.unbind(gl)
    })

    texture._image = image

    return texture
  }
}
