import { Texture   } from './Texture'
import { loadImage } from '../../utilities'

/**
 * An interface for WebGLTexture2D objects
 */
export class Texture2D extends Texture
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} url The location of the image to load
   * @todo Look into WebGLSampler (as an alternative to WebGLTexture?)
   */
  constructor(gl, url)
  {
    super(gl)

    const image = loadImage(url, () => {
      gl.bindTexture(gl.TEXTURE_2D, this.location)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.bindTexture(gl.TEXTURE_2D, null)
    })

    this._image = image
  }


  /**
   * Binds the texture to the `gl.TEXTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    super.bind(gl, gl.TEXTURE_2D)
  }

  /**
   * Unbinds the texture from the `gl.TEXUTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    super.unbind(gl, gl.TEXTURE_2D)
  }
}
