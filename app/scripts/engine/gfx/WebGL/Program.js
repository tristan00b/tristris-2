import { MakeErrorType, MakeLogger } from "../../utilities"


/**
 * Interface for creating and managing a WebGL shader program
 */
export class Program
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  constructor(gl)
  {
    this._location = gl.createProgram()
  }

  /**
   * Returns a WebGL reference to the program
   * @type {WebGLProgram}
   */
  get location()
  {
    return this._location
  }

  /**
   * Returns information about the program
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {String} name The name of the paramter to be retrieved
   * @returns {String}
   */
  getParameter(gl, name)
  {
    return gl.getProgramParameter(this.location, name)
  }

  /**
   * Attaches shaders to the WebGL program
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param  {...Shader} shaders
   */
  attachShaders(gl, ...shaders)
  {
    shaders.forEach(s => gl.attachShader(this.location, s.location))
  }

  /**
   * Links the program, completing the process of preparing the GPU for using the program's shaders
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @throws {ShaderProgramError}
   */
  linkProgram(gl)
  {
    gl.linkProgram(this.location)

    this.getParameter(gl, gl.LINK_STATUS) || do {
      const programLog = gl.getProgramInfoLog(this.location)

      throw new ShaderProgramError(`shader linking failed:\t\n${programLog}`)
    }
  }

  /**
   * Sets the program as part of the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    gl.useProgram(this.location)
  }

  /**
   * Deletes the program
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    gl.deleteProgram(this._location)
    this._location = null
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(Program)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const ProgramError = MakeErrorType(Program)
