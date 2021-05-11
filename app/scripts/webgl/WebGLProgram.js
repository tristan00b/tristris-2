import { MakeErrorType, MakeLogger } from "../Util"


/**
 * Interface for creating and managing a WebGL shader program
 */
export class WebGLProgram
{
  /**
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._location = gl.createProgram()
  }

  /**
   * Returns a WebGL reference to the buffer
   * @type {WebGLBuffer}
   */
  get location()
  {
    return this._location
  }

  /**
   * Returns information about the program
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} name The name of the paramter to be retrieved
   * @returns {String}
   */
  getParameter(gl, name)
  {
    return gl.getProgramParameter(this.location, name)
  }

  /**
   * Attaches shaders to the WebGL program
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param  {...WebGLShader} shaders
   */
  attachShaders(gl, ...shaders)
  {
    shaders.forEach(s => gl.attachShader(this.location, s.location))
  }

  /**
   * Links the program, completing the process of preparing the GPU for using the program's shaders
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @throws {WebGLProgramError}
   */
  linkProgram(gl)
  {
    gl.linkProgram(this.location)

    this.getParameter(gl, gl.LINK_STATUS) || do {
      const programLog = gl.getProgramInfoLog(this.location)

      throw new WebGLProgramError(`shader linking failed:\t\n${programLog}`)
    }
  }

  /**
   * Sets the program as part of the current rendering state
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    gl.useProgram(this.location)
  }

  /**
   * Deletes the program
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    gl.deleteProgram(this._location)
    this._location = null
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(WebGLProgram)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const WebGLProgramError = MakeErrorType(WebGLProgram)
