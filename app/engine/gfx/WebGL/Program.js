import { isArray, MakeErrorType, MakeLogger } from "../../utilities"
import { onErrorThrowAs } from "./utilities"


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
   * Given a WebGL shader program and an attribute name, queries the program for the index of the attribute.
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to query
   * @param {*} name The name of the vertex attribute variable to query `program` for
   */
  static getAttributeIndex(gl, program, name)
  {
    return gl.getAttribLocation(program.location, name)
  }

  /**
   * Returns information about the program
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to query
   * @param {Number} pname A GLenum specifying paramter to be retrieved
   * @returns {*} Return value depends on the parameter that is queried for
   */
  static getParameter(gl, program, pname)
  {
    const param = gl.getProgramParameter(program.location, pname)
      ?? throw new ProgramError(`Failed to get program parameter (${pname})`)

    // Some results are returned as typed arrays, which can cause problems down the line
    // so we catch any arrays returned by WebGL and convert them to normal arrays
    return isArray(param) ? Array.from(param) : param
  }

  /**
   * Gets a list of uniform block indices for a given `WebGLProgram`
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to query
   * @returns {Number[]} An array of uniform block indices for `program`
   */
  static getUniformBlockIndices(gl, program)
  {
    const count = this.getParameter(gl, program, gl.ACTIVE_UNIFORM_BLOCKS)
    return [...Array(count).keys()]
  }

  /**
   * Gets the index of a uniform block given its name
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to query
   * @param {String} blockName
   * @returns {Number}
   */
  static getUniformBlockIndex(gl, program, blockName)
  {
    return gl.getUniformBlockIndex(program, blockName)
  }

  /**
   * Gets the name of a uniform block given its index
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to query
   * @param {Number} blockIndex
   * @returns {String}
   */
  static getUniformBlockName(gl, program, blockIndex)
  {
    return gl.getActiveUniformBlockName(program.location, blockIndex)
  }

  /**
   * Gets information pertaining to a given uniform block
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the block to query
   * @param {Number} pname A GLenum specifying paramter to be retrieved
   * @returns {*} Return value depends on the parameter that is queried for
   */
  static getUniformBlockParameter(gl, program, blockIndex, pname)
  {
    const result = gl.getActiveUniformBlockParameter(program.location, blockIndex, pname)
      ?? throw new ProgramError(`Failed to get uniform block parameter (${pname}) for blockIndex ${blockIndex}`)

    // Some results are returned as typed arrays, which can cause problems down the line
    // so we catch any arrays returned by WebGL and convert them to normal arrays
    return isArray(result) ? Array.from(result) : result
  }

  /**
   * Reports whether a block is referenced by a WebGLProgram's associated vertex shader
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the block to query
   * @returns {Boolean}
   */
  static isBlockReferencedByVertShader(gl, program, blockIndex)
  {
    return this.getUniformBlockParameter(gl, program, blockIndex, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER)
  }

  /**
   * Reports whether a block is referenced by a WebGLProgram's associated fragment shader
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the block to query
   * @returns {Boolean}
   */
  static isBlockReferencedByFragShader(gl, program, blockIndex)
  {
    return this.getUniformBlockParameter(gl, program, blockIndex, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER)
  }

  /**
   * Gets this size of a uniform block in bytes
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the block to query
   * @returns {Number} The size of the uniform block in bytes
   */
  static getUniformBlockDataSize(gl, program, blockIndex)
  {
    return this.getUniformBlockParameter(gl, program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE)
  }

  /**
   * Gets indices for each uniform within a given block
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the block to query
   * @returns {Number[]} The indices for each uniform within the block
   */
  static getBlockUniformIndices(gl, program, blockIndex)
  {
    return this.getUniformBlockParameter(gl, program, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
  }

  /**
   * Gets information pertaining to a given uniform block
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number[]} uniformIndices The indices of the block uniforms to query
   * @param {Number} pname A GLenum specifying paramter to be retrieved
   * @returns {*} Return value depends on the parameter that is queried for
   */
  static getBlockUniformParameter(gl, program, uniformIndices, pname)
  {
    const result = gl.getActiveUniforms(program.location, uniformIndices, pname)
    onErrorThrowAs(gl, ProgramError)
    return result
  }

  /**
   * Returns a list of names of uniforms corresponding to a given list of indices
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number[]} uniformIndices The indices of the block uniforms to query
   * @returns {String[]} The names of the queried uniforms
   */
  static getBlockUniformNames(gl, program, uniformIndices)
  {
    return uniformIndices.map(uniformIndex => gl.getActiveUniform(program.location, uniformIndex))
                         .map(uniformInfo  => uniformInfo.name)
  }

  /**
   * Returns an array indicating the sizes (number of entries, not size in bytes!) of the uniforms queried
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number[]} uniformIndices The indices of the block uniforms to query
   * @returns {Number[]} The sizes of the queried uniforms
   */
  static getBlockUniformSizes(gl, program, uniformIndices)
  {
    return this.getBlockUniformParameter(gl, program, uniformIndices, gl.UNIFORM_SIZE)
  }

  /**
   * Returns a list of `GLenum` values corresponding to the types of the uniforms queried
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number[]} uniformIndices The indices of the block uniforms to query
   */
  static getBlockUniformTypes(gl, program, uniformIndices)
  {
    return this.getBlockUniformParameter(gl, program, uniformIndices, gl.UNIFORM_TYPE)
  }

  /**
   * Gets the byte offsets for each uniform within a given block
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} uniformIndices The indices of the block uniforms to query
   * @returns {Number[]} The byte offsets for each uniform within the block
   */
  static getBlockUniformOffsets(gl, program, uniformIndices)
  {
    return gl.getActiveUniforms(program.location, uniformIndices, gl.UNIFORM_OFFSET)
  }

  /**
   * Binds a uniform block of a given `WebGLProgram` to a bind point so as to be able to read from a uniform
   * buffer, that is connected to the same bind point, when the shader is executed
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the uniform block
   * @param {Number} bindPoint The bind point to accociate the uniform block with
   */
  static bindBlockIndex(gl, program, blockIndex, bindPoint)
  {
    gl.uniformBlockBinding(program.location, blockIndex, bindPoint)
  }

  /**
   * Unbinds a uniform block from its associated bindpoint
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Program} program The shader program to which the uniform block belongs
   * @param {Number} blockIndex The index of the uniform block
   */
  static unbindBlockIndex(gl, program, blockIndex)
  {
    gl.uniformBlockBinding(program.location, blockIndex, null)
  }

  /**
   * Returns a WebGL reference to the program
   * @type {external:WebGLProgram}
   * @readonly
   */
  get location()
  {
    return this._location
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
   * @throws {ProgramError} Throws on program link failure
   */
  linkProgram(gl)
  {
    gl.linkProgram(this.location)

    Program.getParameter(gl, this, gl.LINK_STATUS) || do {
      const programLog = gl.getProgramInfoLog(this.location)

      throw new ProgramError(`shader linking failed:\t\n${programLog}`)
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
