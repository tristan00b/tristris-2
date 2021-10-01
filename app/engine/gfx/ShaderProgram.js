import { createAttributeSetter,
         createUniformSetter,
         createUniformBlockSetter,
         createBlockUniformSetter  } from './WebGL/ShaderTypeSetters'
import { Program,
         UniformBuffer,
         Shader,
         onErrorThrowAs            } from './WebGL/all'
import { MakeErrorType,
        MakeLogger                } from '../utilities'

/**
 * Stores information pertaining to a single uniform block of a given WebGL shader program
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
 * Maps a named uniform block to a bind point, so as to coordinate gpu memory sharing between shaders via uniform buffers
 * - Shaders having a set of uniform blocks in common can share a set of uniform blocks (e.g. for lighting) for improved
 *   rendering efficiency
 * @typedef UniformBlockBinding
 * @param {String} blockName
 * @param {Number} blockIndex
 * @param {Number} bindPoint
 * @see {@link ShaderProgram#initUniformBlockSetters|ShaderProgram.initUniformBlockSetters}
 * @private
 */


/**
 * Provides a convenient interface for WebGL shaders
 */
export class ShaderProgram
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param  {...Object.<external:GLenum, String>} shaders Arrays grouping shader type (e.g. `gl.VERTEX_SHADER`) followed by the corresponding GLSL source
   * @example
   * const shader = new ShaderProgram(gl,
   *   { type: gl.VERTEX_SHADER,   source: shaders.vsource },
   *   { type: gl.FRAGMENT_SHADER, source: shaders.fsource })
   */
  constructor(gl, ...shaders)
  {
    this._shaders = shaders.map(({ type, source }) => new Shader(gl, type, source))

    this._program = new Program(gl)
    this._program.attachShaders(gl, ...(this._shaders))
    this._program.linkProgram(gl)

    this._setters = {}
    this._setters.attributes = createAttributeSetters(gl, this.program)
    this._setters.uniforms   = createUniformSetters(gl, this.program)
  }

  /**
   * The internal `WebGLProgram` reference for which this class provides an interface
   * @type {external:WebGLProgram}
   * @readonly
   */
  get program()
  {
    return this._program
  }

  /**
   * Returns `true` when this shader owns the buffers providing shared access to a common set of uniform blocks
   * @type {Boolean}
   * @see {@link ShaderProgram#initUniformBlockSetters}
   * @readonly
   */
  get isDesignated()
  {
    return this._isDesignated
  }

  /**
   * Returns `true` when this shader has successfully had its uniform block setters initialized
   * @type {Boolean}
   * @readonly
   */
  get hasUniformBlockBindings()
  {
    return !!this._uniformBlockBindings
  }

  /**
   * Initializes uniform block setters for a given shader. When called without the optional `shader` arg, this shader
   * will initialize and own the uniform buffers for its set of uniform blocks (if any), as well as provide bindings to
   * to enable access to these buffers by other shaders, whose programs reference the same set of uniform blocks.
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {ShaderProgram} [shader] A shader on which this method as already been successfully called
   *
   * @example
   * // 0. Create shaders according to your program's needs
   * const shaders = createShaders(opts)
   *
   * // 1. Init uniform block setters on the first shader
   * shaders[0].initUniformBlockSetters(gl)
   *
   * // 2. Initialize uniform block setters for the remaining shaders
   * shaders.slice(1).forEach((_, i) => shader[i+1].initUniformBlockSetters(gl, shaders[i]))
   */
  initUniformBlockSetters(gl, shader)
  {
    if (shader?.hasUniformBlockBindings)
    {
      if (!this.isDesignated)
      {
        this._setters.uniformBlocks = shader._setters.uniformBlocks
        this._setters.blockUniforms = shader._setters.blockUniforms
        this._uniformBlockBindings  = shader._uniformBlockBindings

        connectUniformBlocks(gl, this._program, this._uniformBlockBindings)
      }
      else
      {
        Log.warn(`cannot reinitialize uniform block setters on a designated shader`)
      }
    }
    else
    {
      const blockInfoArr          = getUniformBlockInfo(gl, this._program)
      this._uniformBuffers        = createUniformBlockBuffers (gl, blockInfoArr)
      this._uniformBlockBindings  = createUniformBlockBindings(gl, blockInfoArr)
      this._setters.uniformBlocks = createUniformBlockSetters (gl, this._program, blockInfoArr, this._uniformBuffers)
      this._setters.blockUniforms = createBlockUniformSetters (gl, this._program, blockInfoArr, this._uniformBuffers)

      connectUniformBlocks (gl, this._program,        this._uniformBlockBindings)
      connectUniformBuffers(gl, this._uniformBuffers, this._uniformBlockBindings)

      this._isDesignated = true
    }
  }

  /**
   * Sets the shader as part of the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    gl.useProgram(this.program.location)
  }

  /**
   * Removes the shader from the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @todo clarify API/documentation as this unbinds *any* currently attached shader
   */
  unuse(gl)
  {
    gl.useProgram(null)
  }

  /**
   * Deletes internal WebGL objects and all shader parameter setters
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  destroy(gl)
  {
    this._uniformBuffers.forEach(b => b.destroy(gl))
    this._shaders.forEach(s => s.destroy(gl))
    this._program.destroy(gl)

    delete this._uniformBindings
    delete this._setters
    delete this._uniformBuffers
    delete this._shaders
    delete this._program
  }

  /**
   * Sets constant values for vertex attributes (as opposed to using per-vertex array data)
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol|String,*>} attributes An object mapping attribute names to the desired values
   * @returns {ShaderProgram} The `this` object reference
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttrib}
   * @example
   * shader.setAttributes({
   *   vertexColour : Colour.red,
   *   ...
   * })
   */
  setAttributes(gl, attributes)
  {
    setShaderParams(gl, this._setters.attributes, attributes)
    return this
  }

  /**
   * Sets the values of shader uniforms
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol|String,*>} uniforms An mapping uniform names to the desired values
   * @returns {ShaderProgram} The `this` object reference
   * @example
   * shader.setUniforms({
   *   someflag : true,
   *   textureA : 0,
   *   ...
   * })
   */
  setUniforms(gl, uniforms)
  {
    setShaderParams(gl, this._setters.uniforms, uniforms)
    return this
  }

  /**
   * Sets an entire uniform block in one operation
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol|String,ArrayBuffer>} uniforms An object mapping uniform block names to Typed Arrays (e.g. `Float32Array`)
   * @returns {ShaderProgram} The `this` object reference
   * @example
   * shader.setUniformBlocks({
   *   PointLightBlock : new Float32Array(pointLightData), // where pointLightData is a linear array of numeric values
   *   ...
   * })
   */
  setUniformBlocks(gl, uniforms)
  {
    setShaderParams(gl, this._setters.uniformBlocks, uniforms)
    return this
  }

  /**
   * Sets the values of individual block uniforms
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Object.<Symbol|String,*>} uniforms An object mapping block uniform names to the desired values
   * @returns {ShaderProgram} The `this` object reference
   * @example
   * shader.setBlockUniforms({
   *   'MatrixBlock.view'       : camera.lookat,
   *   'MatrixBlock.projection' : camera.projection,
   *   ...
   * })
   */
  setBlockUniforms(gl, uniforms)
  {
    setShaderParams(gl, this._setters.blockUniforms, uniforms)
    return this
  }
}


/**
 * Creates setter callbacks for the attributes associated with a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program for which the setters are being created
 * @returns {Object.<String, ShaderParameterSetterCallback>}  A mapping of attribute names to setter callbacks
 * @private
 */
function createAttributeSetters(gl, program)
{
  const setters = {}
  const attributeCount = gl.getProgramParameter(program.location, gl.ACTIVE_ATTRIBUTES)

  ;[...Array(attributeCount)].forEach(index => {
    const info = Program.getActiveAttribute(gl, program, index)

    // The builtin check may not be needed?
    if (!info || isBuiltin(info.name)) return

    const name    = parseName(info.name)
    setters[name] = createAttributeSetter(gl, info, index)
  })

  return setters
}


/**
 * Creates setter callbacks for the uniforms (excluding block uniforms) associated with a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program for which the setters are being created
 * @returns {Object<String, ShaderParameterSetterCallback>} A mapping of uniform names to setter callbacks
 * @private
 */
function createUniformSetters(gl, program)
{
  // Block uniforms require separate handling, so their indices are filtered out
  const blockUniformIndices = Program.getAllBlockUniformIndices(gl, program)
  const uniformIndices = Program.getAllUniformIndices(gl, program).filter(index => !blockUniformIndices.includes(index))

  const setters = {}
  uniformIndices.forEach(index =>
  {
    const info     = gl.getActiveUniform(program.location, index)
    const location = gl.getUniformLocation(program.location, info.name)
    const name     = parseName(info.name)

    // This check may not be needed...
    if (!location || isBuiltin(info.name)) return

    setters[name] = createUniformSetter(gl, info, location)
  })

  return setters
}


/**
 * Reports information about each Uniform block in a given WebGL program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program to which the uniform block belongs
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

    return {
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
  })
}


/**
 * Creates and initializes buffers for each uniform block of a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {BlockInfo[]} blockInfoArr The info objects corresponding to each respective uniform block
 * @private
 */
function createUniformBlockBuffers(gl, blockInfoArr)
{
  return blockInfoArr.map(info => {
    const buffer = new UniformBuffer(gl)

    buffer.bind(gl)
    gl.bufferData(gl.UNIFORM_BUFFER, info.blockSize, gl.STATIC_DRAW)
    buffer.unbind(gl)

    return buffer
  })
}


/**
 * Generates a list of bindings for each uniform block of a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {BlockInfo[]} blockInfoArr The info objects corresponding to each respective uniform blocks
 * @private
 */
function createUniformBlockBindings(gl, blockInfoArr)
{
  return blockInfoArr.map(info => ({
    blockIndex : info.blockIndex,
    blockName  : info.blockName,
    bindPoint  : info.blockIndex,
  }))
}


/**
 * Creates setter callbacks for the uniform blocks of a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program for which the uniform block setters are being created
 * @param {UniformBlockInfo[]} blockInfoArr The info objects corresponding to each respective uniform blocks
 * @param {UniformBuffer[]} buffers The buffers to create block setters for
 * @returns {Object<String, ShaderParameterSetterCallback>}
 * @private
 */
function createUniformBlockSetters(gl, program, blockInfoArr, buffers)
{
  const setters = {}

  blockInfoArr.forEach(info => {
    const name    = parseName(info.blockName)
    const buffer  = buffers[info.blockIndex]
    setters[name] = createUniformBlockSetter(program, buffer)
  })

  return setters
}


/**
 * Creates setter callbacks for the block uniforms of a given program
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program for which the setters are being created
 * @param {UniformBlockInfo[]} blockInfoArr Array of block info objects whose indices correspond to `buffers`
 * @param {UniformBuffer[]} buffers The buffers to create uniform setters for
 * @returns {Object<String, ShaderParameterSetterCallback>} A mapping of block uniform names to setter callbacks
 * @private
 */
function createBlockUniformSetters(gl, program, blockInfoArr, buffers)
{
  const setters = {}

  blockInfoArr.forEach(info => {
    const buffer = buffers[info.blockIndex]

    info.uniformOffsets.forEach((offset, j) => {
      const name    = info.uniformNames[j]
      const type    = info.uniformTypes[j]
      setters[name] = createBlockUniformSetter(type, program, buffer, offset)
    })
  })

  return setters
}


/**
 * Associates a program's uniform buffers with a given set of bind points
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {UniformBuffer[]} buffers The buffers to connect to bind points
 * @param {UniformBlockBinding[]} bindings A list of bindings mapping uniform blocks to bind points
 * @private
 */
function connectUniformBuffers(gl, buffers, bindings)
{
  bindings.forEach(binding => {
    const buffer = buffers[binding.blockIndex]
    buffer.setBindPoint(gl, binding.bindPoint)
  })
}


/**
 * Associates a program's uniform blocks with a given set of bind points
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Program} program The program for which to connect the uniform blocks to bind points
 * @param {UniformBlockBinding[]} bindings A list mapping uniform blocks to bind points
 * @private
 */
function connectUniformBlocks(gl, program, bindings)
{
  bindings.forEach(binding => Program.bindBlockIndex(gl, program, binding.blockIndex, binding.bindPoint))
}


/**
 * Takes an array of shader parameter setters and applies them to the given name-data pairs
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Object<String, ShaderParameterSetterCallback>} setters A mapping of parameter names to setter callbacks
 * @param {Array.<String, *>} nameDataPairs An array of pairs, mapping a shader paramters to the desired value(s)
 * @private
 */
function setShaderParams(gl, setters, nameDataPairs)
{
  Object.entries(nameDataPairs).forEach(([name, data]) => {
    if (name in setters) {
      // Log.Debug(`setting: ${name}`)
      setters[name](gl, name, data)
    }
  })
}


/**
 * Attempts to determine whether a given name is for a reserved or built-in attribute/uniform
 * @param {String} name The name of the attribute/uniform to check
 * @return {Boolean}
 * @private
 */
function isBuiltin(name)
{
  return name.startsWith('gl_') || name.startsWith('webgl_')
}


/**
 * Parses a name for a given attribute or uniform
 * @param {String} name
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
 * @see {@link module:Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(ShaderProgram)


 /**
  * @see {@link module:Utilities.MakeErrorType}
  * @private
  */
const ShaderProgramError = MakeErrorType(ShaderProgram)
