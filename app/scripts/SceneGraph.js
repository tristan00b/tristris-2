import { mat4 } from 'gl-matrix'
import { MakeLogger } from './Util'
import WebGLUtil from './webgl/WebGLUtil'

export class SceneGraph
{
  /**
   * @param {SceneNode} root
   */
  constructor({ root, camera })
  {
    Object.assign(this, {
      root,
      camera
    })
  }

  generateRenderTasks()
  {
    let postTasks = []
    let curShader = null

    let nodeTasks = [...this.root].flatMap(node =>
    {
      let subTasks = []

      if (node.shader)
      {
        curShader = node.shader

        subTasks.push(gl => {
          curShader.use(gl)

          curShader.setUniforms({
            view_matrix          : this.camera.lookat,
            projection_matrix    : this.camera.perspective
          })
        })

        /** reverse order */
        postTasks.unshift(gl => {
          curShader.unuse(gl)
        })
      }

      if (node.worldTransform)
      {
        subTasks.push(gl => {
          curShader.setUniforms({
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

const Log = MakeLogger(SceneGraph)
