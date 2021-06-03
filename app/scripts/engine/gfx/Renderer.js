import * as WebGL from './WebGL/all'
import { MakeErrorType, MakeLogger } from '../utilities'


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

    /** @todo wrap into configuration scheme */
    {
      const gl = this.context
      gl.frontFace(gl.CCW)
      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
      gl.enable(gl.DEPTH_TEST)
      gl.clearDepth(1.0)
      gl.clearColor(0,0,0,1)
      WebGL.onErrorThrowAs(this.context, RendererError)
    }

    window.addEventListener('resize', this.resizeCanvas.bind(this))
  }

  setActiveCamera(camera)
  {
    if (this._camera !== camera) { this._camera = camera }
  }

  /**
   * Queries the scene for the sequence of `RenderTask` objects required to render the scene
   * @param {SceneGraph} scene
   */
  enqueue(scene)
  {
    this._task_queue.push(...scene.generateRenderTasks())
  }

  /**
   * Executes the sequence of enqueued `RenderTask` objects
   */
  render()
  {
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT)
    this._task_queue.forEach(task => task(this))
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

    if (this._camera)
    {
      this._camera.perspective = { aspect: (gl.canvas.width / gl.canvas.height) }
      Log.debug(`new aspect: ${gl.canvas.width / gl.canvas.height}`)
    }
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
