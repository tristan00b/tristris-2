import { mat4                } from 'gl-matrix'

import { MakeConstEnumerator } from '../utilities'

import { Camera              } from './Camera'
import { Light               } from './Light'
import { Material            } from './Material'
import { Mesh                } from './Mesh'
import { SceneNode           } from './SceneNode'
import { ShaderProgram       } from './ShaderProgram'
import { Transform           } from './Transform'

import { Entity              } from '../ecs/Entity'
import { Query               } from '../ecs/Query'
import { keyFrom, Scene      } from '../ecs/Scene'


const types = [
  Camera,
  Light,
  Material,
  Mesh,
  ShaderProgram,
  Transform,
]


/** */
export const RenderTaskType = MakeConstEnumerator('RenderTaskType', [
  'USE_SHADER',
  'SET_CAMERA',
  'SET_LIGHT',
  'SET_TRANSFORM',
  'SET_MATERIAL',
  'DRAW_MESH'
])


export class RenderTask
{
  constructor(callback, taskType)
  {
    this._task = callback
    this._type = taskType
  }

  /**
   * Returns a enumerator value of type `RenderTaskType` indicating the type of operation (mainly intended for testing
   * and debugging)
   */
  get type()
  {
    return this._type
  }

  /** */
  run(renderer)
  {
    this._task(renderer)
  }

  /**
   * @todo document
   */
  static parseScene(scene)
  {
    const tasks = scene.getComponentsOfType(SceneNode)
      .map(scene.getEntity.bind(scene))
      .map(entity => getEntityState(scene, entity))
      .flatMap(getNodeTasks)

    return tasks
  }
}

/**
 * @todo document
 * @private
 */
function getEntityState(scene, entity)
{
  const state = types.reduce((o, type) => {
      o[keyFrom(type)] = scene.getComponent(entity, type)
      return o
    },
    {}
  )

  return state
}

/**
 * @todo document
 * @private
 */
function getNodeTasks(nodeState)
{
  const shader    = nodeState[keyFrom(ShaderProgram)]
  const camera    = nodeState[keyFrom(Camera)]
  const light     = nodeState[keyFrom(Light)]
  const transform = nodeState[keyFrom(Transform)]
  const material  = nodeState[keyFrom(Material)]
  const mesh      = nodeState[keyFrom(Mesh)]

  const tasks = []

  if (shader)
  {
    const cb = renderer => shader.use(renderer.context)
    tasks.push(new RenderTask(cb, RenderTaskType.USE_SHADER))
  }

  if (camera)
  {
    const cb = renderer => {
      camera.aspect = renderer.context.canvas.width / renderer.context.canvas.height
      shader.setUniforms(renderer.context, {
        'view_matrix'       : camera.lookat,
        'projection_matrix' : camera.projection,
      })
    }

    tasks.push(new RenderTask(cb, RenderTaskType.USE_CAMERA))
  }

  if (light)
  {
    const cb = renderer => shader.setUniforms(renderer.context, {
      'light.position' : light.position,
      'light.colour'   : light.colour,
    })

    tasks.push(new RenderTask(cb, RenderTaskType.USE_LIGHT))
  }

  if (transform)
  {
    const cb = renderer => shader.setUniforms(renderer.context, {
      'model_matrix': transform.worldTransform
    })

    tasks.push(new RenderTask(cb, RenderTaskType.SET_TRANSFORM))
  }

  if (material)
  {
    const cb = renderer => shader.setUniforms(renderer.context, {
      'material.ambient'   :  material.ambient,
      'material.diffuse'   :  material.diffuse,
      'material.specular'  :  material.specular,
      'material.shininess' : [material.shininess],
    })

    tasks.push(new RenderTask(cb, RenderTaskType.SET_MATERIAL))
  }

  if (mesh)
  {
    const cb = renderer => mesh.draw(renderer.context)
    tasks.push(new RenderTask(cb, RenderTaskType.DRAW_MESH))
  }

  return tasks
}
