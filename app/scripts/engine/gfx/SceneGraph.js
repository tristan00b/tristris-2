import { mat4 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * A container for the elements of a renderable scene
 */
export class SceneGraph
{
  /**
   * @param {Object}    args
   * @param {SceneNode} args.root The root a `SceneNode` hierarchy
   * @param {Camera}    args.camera The camera from whose view point to draw the scene with
   * @param {Light[]}   [args.lights] A collection of lights to illuminate the scene with
   */
  constructor({ root, camera, lights })
  {
    this._root = root
    this._camera = camera
    this._lights = lights
  }

  /**
   * Generates the sequence of RenderTask objects for rendering the scene
   * @returns {RenderTask[]}
   *
   * @todo refactor
   */
  generateRenderTasks()
  {
    let preTasks = []
    let postTasks = []
    let curShader = null

    preTasks.push(renderer => {
      renderer.setActiveCamera(this._camera)
    })

    let nodeTasks = [...this._root].flatMap(node =>
    {
      let subTasks = []

      if (node.shader)
      {
        curShader = node.shader

        subTasks.push(renderer => {
          curShader.use(renderer.context)

          curShader.setUniforms(renderer.context, {
            view_matrix       : this._camera.lookat,
            projection_matrix : this._camera.projection
          })
        })

        /* reverse order */
        postTasks.unshift(renderer => {
          curShader.unuse(renderer.context)
        })
      }

      if (node.worldTransform)
      {
        subTasks.push(renderer => {
          curShader.setUniforms(renderer.context, {
            model_matrix : node.worldTransform
          })
        })
      }

      if (node.draw)
      {
        subTasks.push(renderer => node.draw(renderer.context))
      }

      return subTasks
    })

    return [...preTasks, ...nodeTasks, ...postTasks]
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(SceneGraph)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
const SceneGraphError = MakeErrorType(SceneGraph)
