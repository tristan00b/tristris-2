import { Renderable          } from './Renderable'
import { RenderTask          } from './RenderTask'
import { MeshData,
         VertexAttributeType } from './MeshData'
import { quad                } from './meshes/quad'
import { ScreenShader        } from './shaders/ScreenShader'
import { FrameBuffer         } from './WebGL/FrameBuffer'
import { Texture2D           } from './WebGL/Texture2D'
import { onErrorThrowAs,
         resizeCanvas        } from './WebGL/utilities'
import { MakeErrorType,
         MakeLogger          } from '../utilities'

/**
 * Manages drawing the elements of enqueued `SceneGraph` objects
 */
export class Renderer
{
  /**
   * @param {external:WebGL2RenderingContext} context The rendering context
   * @throws {RendererError} Throws a if either the `canvas` or `context` argument is not provided
   */
  constructor(context)
  {
    // this.canvas = canvas ?? throw new RendererError('reference to canvas object not supplied')
    this.context = context ?? throw new RendererError('reference to the context not supplied')

    const gl = this.context
    const [ width, height ] = [gl.canvas.clientWidth, gl.canvas.clientHeight]

    /** @todo wrap into configuration scheme */
    {
      gl.enable(gl.CULL_FACE)
      gl.enable(gl.DEPTH_TEST)
      gl.frontFace(gl.CCW)
      gl.cullFace(gl.BACK)
      gl.clearDepth(1.0)
    }

    this._maxActiveTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
    this._task_queue = []
    this._shader = null

    this.screen = {}
    this.screen.shader = new ScreenShader(gl)
    this.screen.quad = new Renderable(gl, quad(-1, -1, 2, 2), this.screen.shader)

    { // Configure colour texture ------------------------------------------------------------------------------------
      const texture = new Texture2D(gl)
      texture.bind(gl)
      texture.setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      texture.setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      texture.setData(gl, 0, gl.RGB, width, height, gl.RGB, gl.UNSIGNED_BYTE, null)
      texture.unbind(gl)
      this.screen.colourTexture = texture
    }

    { // Configure depth texture -------------------------------------------------------------------------------------
      const texture = new Texture2D(gl)
      texture.bind(gl)
      texture.setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      texture.setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      texture.setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      texture.setData(gl, 0, gl.DEPTH_COMPONENT24, width, height, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
      texture.unbind(gl)
      this.screen.depthTexture = texture
    }

    { // Configure the framebuffer -----------------------------------------------------------------------------------
      this.framebuffer = new FrameBuffer(gl)
      this.framebuffer.bind(gl)
      this.framebuffer.setTextureAttachment(gl, gl.COLOR_ATTACHMENT0, this.screen.colourTexture);
      this.framebuffer.setTextureAttachment(gl, gl.DEPTH_ATTACHMENT,  this.screen.depthTexture );

      // Check framebuffer status
      onErrorThrowAs(gl, RendererError)
      const status = this.framebuffer.getStatus(gl)
      status === gl.FRAMEBUFFER_COMPLETE || throw new RendererError(`framebuffer incomplete (status: ${status})`)

      this.framebuffer.unbind(gl)
    }

    window.addEventListener('resize', this.handleResize.bind(this))
    window.dispatchEvent(new Event('resize'))
  }

  /**
   * @type {Number}
   */
  get maxActiveTextureUnits()
  {
    return this._maxActiveTextureUnits
  }

  /**
   * Specifies which texture unit to make active
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} index
   * @throws {RendererError}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture}
   */
  setActiveTexture(index)
  {
    const gl = this.context
    gl.activeTexture(gl.TEXTURE0 + index)
    onErrorThrowAs(gl, RendererError)
  }

  /**
   * Gets the currently set shader if one has been set
   * @type {ShaderProgram}
   */
  get shader()
  {
    return this._shader
  }

  set shader(shader)
  {
    this._shader = shader
  }

  /**
   * Sets the active shader for RenderTasks to be able to reference (typically called via a preceding
   * render task in a sequence of render tasks, as produced by {@link RenderTask.parseScene})
   * @param {ShaderProgram} shader An instance of ShaderProgram or subclass of ShaderProgram
   * @returns {this}
   */
  setShader(shader)
  {
    this.shader = shader
    return this
  }

  /**
   * Reports whether the renderer currently has a shader set
   * @type {Boolean}
   */
  get isShaderSet()
  {
    return !!this.shader
  }

  /**
   * Tells the renderer to use the currently set shader if one has been set
   * @returns {this}
   */
  useShader()
  {
    if (this.isShaderSet)
    {
      this.shader.use(this.context)
    }
    return this
  }

  /**
   * Tells the renderer to unuse the currently set shader if one has been set
   * @returns {this}
   */
  unuseShader()
  {
    if (this.isShaderSet)
    {
      this.shader.use(null)
    }
    return this
  }

  /**
   * Queries the scene for the sequence of `RenderTask` objects required to render the scene
   * @param {SceneGraph} scene
   */
  enqueue(scene)
  {
    const tasks = RenderTask.parseScene(scene)
    // tasks.forEach(t => console.log(t.description))
    this._task_queue.push(...tasks)
  }

  /**
   * Executes the sequence of enqueued `RenderTask` objects
   */
  render()
  {
    const gl = this.context
    const [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]

    gl.enable(gl.CULL_FACE )
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.1, 0.1, 0.1, 1.0)

    // First pass ------------------------------------------------------------------------------------------------------
    this.framebuffer.bind(gl)

    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the scene into the bound framebuffer
    this._task_queue.forEach(task => task.run(this))

    // Second pass -----------------------------------------------------------------------------------------------------
    this.framebuffer.unbind(gl)
    this.screen.colourTexture.bind(gl)

    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.screen.shader.use(gl)
    this.screen.quad.draw(gl)
  }

  /**
   * Clears the render task queue
   */
  clear()
  {
    this._task_queue = []
  }

  /**
   * A callback for handling window resize events
   * @private
   */
  handleResize()
  {
    this.resizeCanvas()
    this.resizeFrameBuffer()
  }

  /**
   * Updates canvas width and height dimensions to match client with and height dimensions
   * @private
   */
  resizeCanvas()
  {
    resizeCanvas(this.context)
  }

  /**
   * Updates the framebuffer's texture width and height dimensions to match drawing buffer width and height dimensions
   * @private
   */
  resizeFrameBuffer()
  {
    const gl = this.context
    const [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]

    this.screen.colourTexture.bind(gl)
    this.screen.colourTexture.setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
    this.screen.colourTexture.unbind(gl)

    this.screen.depthTexture.bind(gl)
    this.screen.depthTexture.setData(gl, 0, gl.DEPTH_COMPONENT24, width, height, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
    this.screen.depthTexture.unbind(gl)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
var Log = MakeLogger(Renderer)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const RendererError = MakeErrorType(Renderer)
