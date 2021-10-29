import { MakeErrorType,
         MakeLogger                } from '../utilities'
import { Program,
         UniformBuffer,
         Shader,
         onErrorThrowAs            } from './WebGL/all'
import { createAttributeSetter,
         createUniformSetter,
         createUniformBlockSetter,
         createBlockUniformSetter  } from './WebGL/ShaderTypeSetters'


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
   * @private
   */
  static _uniformBlockBuffers = {}

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
    this.program.attachShaders(gl, ...(this._shaders))
    this.program.linkProgram(gl)

    const blockInfoArr          = getUniformBlockInfo(gl, this.program)
    this._uniformBlockBuffers   = createUniformBlockBuffers(gl, blockInfoArr)

    this._setters = {}
    this._setters.attributes    = createAttributeSetters(gl, this.program)
    this._setters.uniforms      = createUniformSetters(gl, this.program)
    this._setters.uniformBlocks = createUniformBlockSetters (gl, this.program, blockInfoArr, this._uniformBlockBuffers)
    this._setters.blockUniforms = createBlockUniformSetters (gl, this.program, blockInfoArr, this._uniformBlockBuffers)

    this._uniformBlockBuffers.forEach(buf => Program.bindBlockIndex(gl, this.program, buf.bindPoint, buf.bindPoint))
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
   * Sets the shader as part of the current rendering state
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  use(gl)
  {
    this.program.use(gl)

    for (const buffer of this._uniformBlockBuffers)
    {
      buffer.bindBase(gl, buffer.bindPoint)
    }
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
    this._program.destroy(gl)
    this._shaders.forEach(s => s.destroy(gl))

    for (const buffer of this._uniformBlockBuffers)
    {
      delete ShaderProgram._uniformBlockBuffers[buffer.blockName]
      buffer.destroy(gl)
    }
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
 * Creates and initializes buffers for each uniform block of a given program. Buffers are cached in a static class
 * property of ShaderProgram, ensuring that programs with the same uniform blocks are able to utilize the same buffers.
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {BlockInfo[]} blockInfoArr The info objects corresponding to each respective uniform block
 * @private
 */
function createUniformBlockBuffers(gl, blockInfoArr)
{
  return blockInfoArr.map(info =>
    (info.blockName in ShaderProgram._uniformBlockBuffers)
    ? ShaderProgram._uniformBlockBuffers[info.blockName]
    : do
    {
      const buffer = new UniformBuffer(gl)

      buffer.blockName = info.blockName
      buffer.bindPoint = info.blockIndex

      buffer.bind(gl)
      buffer.data(gl, info.blockSize)
      buffer.unbind(gl)

      ShaderProgram._uniformBlockBuffers[info.blockName] = buffer
    }
  )
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
 * Takes an array o fshader parameter setters and applies them to the given name-data pairs
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @param {Object<String, ShaderParameterSetterCallback>} setters A mapping of parameter names to setter callbacks
 * @param {Array.<String, *>} nameDataPairs An array of pairs, mapping a shader paramters to the desired value(s)
 * @private
 */
function setShaderParams(gl, setters, nameDataPairs)
{
  Object.entries(nameDataPairs).forEach(([name, data]) => {
    if (name in setters) {
      // Log.debug(`setting: ${name}`)
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
