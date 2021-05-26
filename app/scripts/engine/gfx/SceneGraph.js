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
    let postTasks = []
    let curShader = null

    let nodeTasks = [...this._root].flatMap(node =>
    {
      let subTasks = []

      if (node.shader)
      {
        curShader = node.shader

        subTasks.push(gl => {
          curShader.use(gl)

          curShader.setUniforms(gl, {
            view_matrix          : this._camera.lookat,
            projection_matrix    : this._camera.projection
          })
        })

        /* reverse order */
        postTasks.unshift(gl => {
          curShader.unuse(gl)
        })
      }

      if (node.worldTransform)
      {
        subTasks.push(gl => {
          curShader.setUniforms(gl, {
            model_matrix : node.worldTransform
          })
        })
      }

      if (node.draw)
      {
        subTasks.push(gl => node.draw(gl))
      }

      return subTasks
    })

    return [...nodeTasks, ...postTasks]
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
