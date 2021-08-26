import { loadImage } from '../../utilities'

/**
 * An interface for WebGLTexture2D objects
 */
export class Texture2D
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} url The location of the image to load
   * @todo Look into WebGLSampler (as an alternative to WebGLTexture?)
   */
  constructor(gl, url)
  {
    const textureID = gl.createTexture()
    const image     = loadImage(url, () => {
      gl.bindTexture(gl.TEXTURE_2D, textureID)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.bindTexture(gl.TEXTURE_2D, null)
    })

    this._location = textureID
    this._image    = image
  }

  /**
   * Returns a WebGL reference to the image
   * @type {external:WebGLTexture}
   */
  get location()
  {
    return this._location
  }

  /**
   * Binds the texture to the `gl.TEXTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    gl.bindTexture(gl.TEXTURE_2D, this._location)
  }

  /**
   * Unbinds the texture from the `gl.TEXUTURE_2D` target
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
}
