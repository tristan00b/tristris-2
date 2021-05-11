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

    const gl = this.context
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    gl.enable(gl.DEPTH_TEST)
    gl.clearDepth(1.0)
    gl.clearColor(0,0,0,1)
  }

  enqueue({ model, shader, camera })
  {
    this._queue ??= []
    this._queue.push({ model, shader, camera })
  }

  draw()
  {
    const gl = this.context

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this._queue.forEach(({ model, shader, camera }) => {
      shader.use(gl)

        camera.projection = { aspect: this.canvas.width / this.canvas.height }

        gl.uniformMatrix4fv(shader.uniform.modelMatrix, false, model.transform)
        gl.uniformMatrix4fv(shader.uniform.projectionMatrix, false, camera.perspective)
        gl.uniformMatrix4fv(shader.uniform.viewMatrix, false, camera.lookat)

        model.draw(gl)

      shader.unuse(gl)
    })
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
