import * as WebGL from './WebGL/all'
import { MakeErrorType, MakeLogger } from '../utilities'
import { RenderTask } from './RenderTask'

/**
 * Manages drawing the elements of enqueued `SceneGraph` objects
 */
export class Renderer
{
  /**
   * @param {{ config:Object, canvas:Object }} args
   * @param {Object} args.canvas The canvas object to target
   * @param {external:WebGL2RenderingContext} context The rendering context
   * @throws {RendererError} Throws a if either the `canvas` or `context` argument is not provided
   */
  constructor({ canvas, context })
  {
    this.canvas = canvas ?? throw new RendererError('reference to canvas object not supplied')
    this.context = context ?? throw new RendererError('reference to the context not supplied')
    this._task_queue = []
    this._shader = null

    /** @todo wrap into configuration scheme */
    {
      const gl = this.context
      gl.enable(gl.CULL_FACE)
      gl.enable(gl.DEPTH_TEST)
      gl.frontFace(gl.CCW)
      gl.cullFace(gl.BACK)
      gl.clearDepth(1.0)

      WebGL.onErrorThrowAs(this.context, RendererError)
    }

    window.addEventListener('resize', this.resizeCanvas.bind(this))
    window.dispatchEvent(new Event('resize'))
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
    this._task_queue.push(...tasks)
  }

  /**
   * Executes the sequence of enqueued `RenderTask` objects
   */
  render()
  {
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT)
    this._task_queue.forEach(task => {
      task.run(this)
    })
  }

  /**
   * Clears the render task queue
   */
  clear()
  {
    this._task_queue = []
  }

  /**
   * Sets the canvas dimensions to match the client dimensions. Called automatically when the window is resized.
   */
  resizeCanvas()
  {
    const gl = this.context
    WebGL.resizeCanvas(gl)
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
