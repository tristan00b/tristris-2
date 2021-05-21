import { MakeErrorType, MakeLogger } from './Util'


/**
 * @class
 */
export class Renderer
{
  /**
   * @constructor
   * @param {{ config:Object, canvas:Object }} args
   * @param {Object} args.config
   * @param {Object} args.canvas
   * @throws {RendererError}
   */
  constructor({ canvas, context })
  {
    this.canvas = canvas ?? throw new RendererError('reference to canvas object not supplied')
    this.context = context ?? throw new RendererError('reference to the context not supplied')
    this._task_queue = []

    const gl = this.context
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    gl.enable(gl.DEPTH_TEST)
    gl.clearDepth(1.0)
    gl.clearColor(0,0,0,1)
  }

  enqueue(scene)
  {
    this._task_queue.push(...scene.generateRenderTasks())
  }

  render()
  {
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT)
    this._task_queue.forEach(task => task(this.context))
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
var Log = MakeLogger(Renderer)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const RendererError = MakeErrorType(Renderer)
