import { createAttributeSetter,
         createUniformSetter,
         createUniformBlockSetter,
         createBlockUniformSetter   } from './WebGL/ShaderTypeSetters'
import { MakeErrorType, MakeLogger  } from '../utilities'
import { Program                    } from './WebGL/Program'
import { UniformBuffer              } from './WebGL/UniformBuffer'
import * as WebGL                     from './WebGL/all'


/**
 * @todo Document module description
 * @module Engine/gfx/ShaderProgram
 */


/**
 * A container for Uniform Block Information with respect to a given WebGL shader program
 * @typedef {Object} UniformBlockInfo
 * @param {Number} blockIndex The index of the block
 * @param {String} blockName The name of the block
 * @param {Number} blockSize The size of the block (in bytes)
 * @param {Boolean} isInVertexShader Reports whether the block is referenced by the program's vertex shader
 * @param {Boolean} isInFragmentShader Reports whether the block is referenced by the program's fragment shader
 * @param {Number[]} uniformIndices The indices of each block uniform
 * @param {Number[]} uniformOffsets The offsets of each block uniform (in bytes)
 * @param {String[]} uniformNames The names of each block uniform
 * @param {Number[]} uniformSizes The sizes of each block uniform
 * @param {TypeSetterMappingFrom[]} uniformTypes The types of each block uniform
 * @private
 */


/**
 * Maps a named uniform block to a bind point, so as to coordinate gpu memory sharing between shaders (via uniform buffers)
 * - Shaders having the same name and structure for a given uniform block can share the memory allocated to a single buffer
 * - A designated shader instantiates and initializes a buffer for each of its uniform blocks then assigns bind points
 *   to them. The list of bindings is then available through a property on the designated shader for other shaders to
 *   coordinate to.
 * @typedef UniformBlockBinding
 * @param {String} blockName
 * @param {Number} bindPoint
 * @see {@link module:Engine/gfx/ShaderProgram.ShaderProgram#createUniformBlockSetters}
 * @private
 */


/**
 * Provides an interface for interacting with WebGL shader programs
 */
export class ShaderProgram
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param  {...Array} shaders Arrays grouping shader type (e.g. `gl.VERTEX_SHADER`) followed by the corresponding GLSL source
   * @example
   * const shader = new ShaderProgram(gl,
   *   { type: gl.VERTEX_SHADER,   source: shaders.vsource },
   *   { type: gl.FRAGMENT_SHADER, source: shaders.fsource })
   */
  constructor(gl, ...shaders)
  {
    this._shaders = shaders.map(({ type, source }) => new WebGL.Shader(gl, type, source))

    this._program = new WebGL.Program(gl)
    this._program.attachShaders(gl, ...(this._shaders))
    this._program.linkProgram(gl)

    this._setters = {}
    this._setters.attributes = createAttributeSetters(gl, this.location)
    this._setters.uniforms   = createUniformSetters(gl, this.location)
  }

  /**
   * The internal reference `WebGLProgram` reference for which this class provides an interface
   * @type {external:WebGLProgram}
   * @readonly
   */
  get location()
  {
    return this._program.location
  }

  /**
   * Returns `true` when `createUniformBlockSetters` has been called on this instance, `false` otherwise
   * @type {Boolean}
   * @readonly
   */
  get isDesignated()
  {
    return !!this._uniformBlockBindings
  }

  /**
   * Called on a `ShaderProgram` that has been designated (chosen) to be responsible for managing shared (uniform block) memory
   *
   * Note: All shaders needing to utilize shared memory must include the same named uniform blocks with the same layout
   * for each respective block
   *
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @returns {ShaderProgram} The `this` object referece
   * @example
   * const shaders = createShaders(opts) // create shaders according to your program
   *
   * // 1. We'll designate `shaders[0]` as responsible for instantiating shared memory by the following call:
   * const designatedShader = shaders[0].createUniformBlockSetters(gl)
   *
   * // Note that designatedShader === shaders[0]
   *
   * // 2. Coordinate the remaining shaders with the designated shader thusly:
   * shaders.slice(1).forEach(shader => shader.setUniformBlockSetters(gl, designatedShader)
   *
   * @see {@link module:Engine/gfx/ShaderProgram.ShaderProgram#updateUniformBlockSetters}
   */
  createUniformBlockSetters(gl)
  {
    // 1. Get Uniform Block info array
    const blockInfoArr = getUniformBlockInfo(gl, this.location)

    // 2. Generate UBOs
    const buffers = createUniformBlockBuffers(gl, blockInfoArr)

    // 3. Select bind points
    // Reusing block indices for convenience--this may be refactored later if more precise control is desired
    const bindPoints = blockInfoArr.map(info => info.blockIndex)

    // 4. Connect UBO's to bind points
    bindUniformBuffers(gl, buffers, bindPoints)

    // 5. Connect this shaders's blockIndices to the same bind poitns
    bindUniformBlocks(gl, this.location, bindPoints)

    // 6. Create binding map
    const bindings = createUniformBlockBindings(blockInfoArr, buffers)

    // 7. Create Uniform Block Setters
    const ubSetters = _createUniformBlockSetters(gl, this.location, blockInfoArr, buffers)

    // 7. Create Block Uniform Setters
    const buSetters = createBlockUniformSetters(gl, this.location, blockInfoArr, buffers)

    this._setters.uniformBlocks = ubSetters
    this._setters.blockUniforms = buSetters
    this._uniformBuffers = buffers
    this._uniformBlockBindings = bindings

    return this
  }

  /**
   * Given a shader that has been designated as responsible for managing shared (uniform block) memory, updates its own
   * configuration so as to be able to utilize the shared memory.
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {ShaderProgram} designatedShader The shader instance on which `createUniformBlockSetters` was called
   * @throws {ShaderProgramError} Throws when this method called after calling `createUniformBlockSetters` on the same instance
   * @see {@link module:Engine/gfx/ShaderProgram.ShaderProgram#createUniformBlockSetters}
   */
  updateUniformBlockSetters(gl, designatedShader)
  {
    this.isDesignated && throw new ShaderProgramError('Cannot update uniform block setters on a designated shader')

    const s = designatedShader
    this._setters.blockUniforms = s._setters.blockUniforms

    s._uniformBlockBindings.forEach(({ blockName, blockPoint }) => {
      const blockIndex = Program.getUniformBlockIndex(gl, this.location, blockName)
      const blockSize  = Program.getUniformBlockDataSize(gl, this.location, blockIndex)
      Program.bindBlockIndex(gl, this.location, blockIndex, blockPoint)
    })
  }

  /**
   * Sets the shader program as part of the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    gl.useProgram(this.location)
  }

  /**
   * Removes the shader program from the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  unuse(gl)
  {
    gl.useProgram(null)
  }

  /**
   * Sets constant values for vertex attributes
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol,(Number[]|Boolean[])>} attributes
   * @example
   * shader.setAttributes({
   *   a_vertexColour : Colour.red,
   *   ...
   * })
   * @see For usage information, see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttrib|here}.
   */
  setAttributes(gl, attributes)
  {
    setShaderParams(gl, this._setters.attributes, attributes)
    return this
  }

  setUniformBlocks(gl, uniforms)
  {
    setShaderParams(gl, this._setters.uniformBlocks, uniforms)
    return this
  }

  /**
   * Sets the values of shader block uniforms
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol,(Number[]|Boolean[])>} uniforms An object containing keys matching names of shader uniforms to set, and corresponding values
   */
  setBlockUniforms(gl, uniforms)
  {
    setShaderParams(gl, this._setters.blockUniforms, uniforms)
    return this
  }

  /**
   * Sets the values of shader uniforms
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol,(Number[]|Boolean[])>} uniforms An object containing keys matching names of shader uniforms to set, and corresponding values
   * @example
   * shader.setUniforms({
   *   u_viewMatrix       : camera.lookat,
   *   u_projectionMatrix : camera.projection,
   *   ...
   * })
   */
  setUniforms(gl, uniforms)
  {
    setShaderParams(gl, this._setters.uniforms, uniforms)
    return this
  }

  /**
   * Deletes associated WebGL objects
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    this.isDesignated && this._uniformBuffers.forEach(b => b.destroy(gl))
    this._shaders.forEach(s => s.destroy(gl))
    this._program.destroy(gl)
  }

  getAllUniformNames(gl)
  {
    return [...Object.keys(this._setters.uniforms)]
  }

  getAllUniformBlockNames(gl)
  {
    return [...Object.keys(this._setters.uniformBlocks)]
  }

  getAllBlockUniformNames(gl)
  {
    return [...Object.keys(this._setters.blockUniforms)]
  }
}


/**
 * Creates setter callbacks for all attributes associated with a given shader program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @returns {Object<String, ShaderParameterSetterCallback>}  A mapping of attribute names to setter callbacks
 * @private
 */
function createAttributeSetters(gl, program)
{
  const setters = {}
  const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

  ;[...Array(attributeCount)].forEach(index => {
    const info     = gl.getActiveAttrib(program, index)
    const location = gl.getAttribLocation(program, info.name)
    const name     = parseName(info.name)

    // This check may not be needed...
    if (!location || isBuiltin(info.name)) return

    setters[name] = createAttributeSetter(gl, info, location)
  })

  return setters
}


/**
 * Creates setter callbacks for all uniforms, excluding block uniforms, associated with a given shader program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @returns {Object<String, ShaderParameterSetterCallback>} A mapping of uniform names to setter callbacks
 * @private
 */
function createUniformSetters(gl, program)
{
  /* Gets all block uniform indices */
  function getBlockUniformIndices()
  {
    const blockCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS)
    const blockUniformIndices = [...Array(blockCount).keys()].flatMap(blockIndex => {
      const indices = gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
      return indices
    })
    return blockUniformIndices
  }

  /* Gets all uniform indices */
  function getUniformIndices()
  {
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    return [...Array(uniformCount).keys()]
  }

  // Block uniforms require separate handling, so their indices are filtered out
  const blockUniformIndices = getBlockUniformIndices()
  const uniformIndices = getUniformIndices().filter(index => !blockUniformIndices.includes(index))

  const setters = {}
  uniformIndices.forEach(index =>
  {
    const info     = gl.getActiveUniform(program, index)
    const location = gl.getUniformLocation(program, info.name)
    const name     = parseName(info.name)

    // This check may not be needed...
    if (!location || isBuiltin(info.name)) return

    setters[name] = createUniformSetter(gl, info, location)
  })

  return setters
}


function _createUniformBlockSetters(gl, program, blockInfoArr, buffers)
{
  const setters = {}

  blockInfoArr.forEach((info, i) => {
    const buffer = buffers[i]
    info.blockSize <= buffer.size || throw new ShaderProgramError(`failed to create uniform block setters (buffer undersized, got buffer(${buffer.size})/block(${info.blockSize}))`)

    const name = parseName(info.blockName)
    setters[name] = createUniformBlockSetter(program, buffer)
  })

  return setters
}

/**
 * Creates setter callbacks for all block uniforms associated with a given shader program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program for which the setters are being created
 * @param {Array.<UniformBlockInfo, UniformBuffer>} blockBufferPairs  A list of pairs matching buffers to blocks
 * @returns {Object<String, ShaderParameterSetterCallback>} A mapping of block uniform names to setter callbacks
 * @private
 */
function createBlockUniformSetters(gl, program, blockInfoArr, buffers)
{
  const setters = {}

  blockInfoArr.forEach((info, i) => {

    const buffer = buffers[i]

    info.blockSize <= buffer.size || throw new ShaderProgramError(`failed to create block uniform setters (buffer undersized, got buffer(${buffer.size})/block(${info.blockSize}))`)

    info.uniformOffsets.forEach((offset, j) => {
      const name = info.uniformNames[j]
      const type = info.uniformTypes[j]

      setters[name] = createBlockUniformSetter(type, program, buffer, offset)
    })
  })

  return setters
}


/**
 * Associates a list of buffers with a list of bind points (corresponding by index)
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {UniformBuffer[]} buffers The buffers to connect to bind points
 * @param {Number[]} bindPoints The respective bind points to connect the buffers to
 * @throws {ShaderProgramError} Throws when the lengths of `buffers` and `bindPoints` do not match
 * @private
 */
function bindUniformBuffers(gl, buffers, bindPoints)
{
  buffers.length === bindPoints.length || throw new ShaderProgramError(`failed to bind uniform buffers (buffers-bindPoints length mismatch)`)
  buffers.forEach((buffer, i) => buffer.setBindPoint(gl, bindPoints[i]))
}


/**
 * Associates a shader's uniform blocks
 * @private
 */
function bindUniformBlocks(gl, program, bindPoints)
{
  const blockIndices = Program.getUniformBlockIndices(gl, program)
  blockIndices.length === bindPoints.length || throw new ShaderProgramError(`failed to bind uniform blocks (blockIndices-bindPoints length mismatch)`)
  blockIndices.forEach((blockIndex, i) => Program.bindBlockIndex(gl, program, blockIndex, bindPoints[i]))
}


/**
 * Important: must be called after setting buffer bind points
 * @private
 */
function createUniformBlockBindings(blockInfoArr, buffers)
{
  const bindings = blockInfoArr.map((info, i) => {
    const buffer = buffers[i]

    info.blockSize <= buffer.size || throw new ShaderProgramError(`failed to create uniform block bindings (buffer undersized, got buffer(${buffer.size})/block(${info.blockSize}))`)
    buffer.bindPoint ?? throw new ShaderProgramError(`failed to create uniform block bindings (buffer bind point not set)`)

    return {
      blockName  : info.blockName,
      blockPoint : buffer.bindPoint,
    }
  })

  return bindings
}


/**
 * Reports information about each Uniform block in a given WebGL shader program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {external:WebGLProgram} program The WebGL shader program to which the uniform block belongs
 * @returns {UniformBlockInfo[]}
 * @private
 */
function getUniformBlockInfo(gl, program)
{
  return Program.getUniformBlockIndices(gl, program).map(blockIndex => {
    const blockName      = Program.getUniformBlockName(gl, program, blockIndex)
    const blockSize      = Program.getUniformBlockDataSize(gl, program, blockIndex)
    const isInVertShader = Program.isBlockReferencedByVertShader(gl, program, blockIndex)
    const isInFragShader = Program.isBlockReferencedByFragShader(gl, program, blockIndex)
    const uniformIndices = Program.getBlockUniformIndices(gl, program, blockIndex)
    const uniformNames   = Program.getBlockUniformNames(gl, program, uniformIndices)
    const uniformOffsets = Program.getBlockUniformOffsets(gl, program, uniformIndices)
    const uniformSizes   = Program.getBlockUniformSizes(gl, program, uniformIndices)
    const uniformTypes   = Program.getBlockUniformTypes(gl, program, uniformIndices)

    const info = {
      blockIndex,
      blockName,
      blockSize,
      isInVertShader,
      isInFragShader,
      uniformIndices,
      uniformNames,
      uniformOffsets,
      uniformSizes,
      uniformTypes,
    }

    // console.log(info)

    return info
  })
}


/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {BlockInfo[]} blockInfoArr Used to determine the number of buffers to create and their respective sizes
 * @private
 */
function createUniformBlockBuffers(gl, blockInfoArr)
{
  return blockInfoArr.map(info => new UniformBuffer(gl, info.blockSize * 3))
}


/**
 * Takes an array of shader parameter setters and applies them to the given array of parameters
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Object<String, ShaderParameterSetterCallback>} setters A mapping of parameter names to setter callbacks,
 *   as returned by `createShader[Attribute|Uniform]Setters`
 * @param {Array.<String, *>} nameDataPairs An array of name-data pairs, specifying a shader paramter and the value(s)
 * to set it with, respectively.
 * @private
 */
function setShaderParams(gl, setters, nameDataPairs)
{
  Object.entries(nameDataPairs).forEach(([name, data]) => {
    if (name in setters) {
      // console.log(`setting: ${name}`)
      setters[name](gl, name, data)
    }
  })
}


/**
 * Returns true if the `WebGLActiveInfo` object is for a reserved or built-in attribute or uniform
 * @param {external:WebGLActiveInfo} info As returned from `gl.getActiveUniform` or `gl.getActiveAttrib`
 * @return {bool} true if attribute/uniform is reserved
 * @private
 */
function isBuiltin(name)
{
  return name.startsWith('gl_') || name.startsWith('webgl_')
}


/**
 * Parses the name property from a given `WebGLActiveInfo` object
 * @param {external:WebGLActiveInfo} info As returned from `gl.getActiveUniform` or `gl.getActiveAttrib`
 * @returns {String}
 * @private
 */
function parseName(name)
{
  return name.endsWith('[0]')
       ? name.slice(0, -3)
       : name
}


/**
 * @private
 * @see {@link module:Utilities.MakeLogger}
 */
 var Log = MakeLogger(ShaderProgram)


 /**
  * @private
  * @see {@link module:Utilities.MakeErrorType}
  */
 const ShaderProgramError = MakeErrorType(ShaderProgram)
