import { MakeErrorType, MakeLogger } from "../Util";


/**
 * Interface for manageing vertex array attributes
 */
export class WebGLVertexArray
{
  /**
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._location = gl.createVertexArray()
  }

  /**
   * Returns a WebGL reference to the vertex array object
   * @type {module:WebGL.Buffer}
   */
  get location()
  {
    return this._location
  }

  /**
   * Binds the WebGLVertexArray to the buffer
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  bind(gl)
  {
    gl.bindVertexArray(this.location)
  }

  /**
   * Unbinds the WebGLVertexArray from the buvver
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unbind(gl)
  {
    gl.bindVertexArray(null)
  }

  /**
   * Turns on the vertex attribue at the specified index into the list of attribute arrays
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLuint} index The index of the vertex attribute to enable
   */
  enableAttribute(gl, index)
  {
    gl.enableVertexAttribArray(index)
  }

  /**
   * Turns off the vertex attribute array at the specified index
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLuint} index The index of the vertex attribute to disable
   */
  disableAttribute(gl, index)
  {
    gl.disableVertexAttribArray(index)
  }

  /**
   * Specifies the location and data format of a generic vertex attribute to use while rendering
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {GLuint} index The index of the vertex attribute to be used
   * @param {GLint} components The number of components per vertex attribute (must be in range [0..4])
   * @param {GLenum} type The component data type (e.g. gl.FLOAT)
   * @param {Boolean} [normalize] Specifies whether integer data values should be normalized
   * @param {GLsizei} [stride] The offset between consecutive attributes in the array (must be in range [0..255])
   * @param {GLintptr} [offset] The offset in bytes of the first component in the vertex attribute array (must be a multiple of the byte length of `type`)
   */
  defineAttributePointer(gl, index, components, type, normalize=false, stride=0, offset=0)
  {
    gl.vertexAttribPointer(index, components, type, normalize, stride, offset)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(WebGLVertexArray)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const WebGLVertexArrayError = MakeErrorType(WebGLVertexArray)
