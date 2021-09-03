import { mat4                } from 'gl-matrix'

import { MakeConstEnumerator } from '../utilities'

import { Camera              } from './Camera'
import { Light               } from './Light'
import { Material            } from './Material'
import { Mesh                } from './Mesh'
import { ShaderProgram       } from './ShaderProgram'
import { Transform           } from './Transform'

import { Entity              } from '../ecs/Entity'
import { Query               } from '../ecs/Query'
import { keyFrom, Scene      } from '../ecs/Scene'
import { SceneNode           } from '../ecs/SceneNode'

import { Texture2D           } from './WebGL/Texture2D'


/** @module Engine/gfx/RenderTask */


const types = [
  Camera,
  Light,
  Material,
  Mesh,
  ShaderProgram,
  Texture2D,
  Transform,
]


const taskType = [
  'USE_SHADER',
  'SET_CAMERA',
  'SET_LIGHT',
  'SET_TRANSFORM',
  'USE_TEXTURE_2D',
  'SET_MATERIAL',
  'DRAW_MESH'
]
const RenderTaskDescription = Object.freeze(taskType)

/**
 * Enumerator for types of {@link module:Engine/gfx/RenderTask.RenderTask} operations (intended for debugging puprposes)
 * @type {enum}
 * @property {Number} USE_SHADER
 * @property {Number} SET_CAMERA
 * @property {Number} SET_LIGHT
 * @property {Number} SET_TRANSFORM
 * @property {Number} USE_TEXTURE_2D
 * @property {Number} SET_MATERIAL
 * @property {Number} DRAW_MESH
 */
export const RenderTaskType = MakeConstEnumerator('RenderTaskType', taskType)


/**
 * @typdedef RenderTaskCallback
 * @param {Renderer} renderer
 */


/**
 * A class for storing rendering operations, to be invoked by the renderer at draw time.
 */
export class RenderTask
{
  /**
   * @param {RenderTaskCallback}
   */
  constructor(callback, taskType)
  {
    this._task = callback
    this._type = taskType
    this._description = RenderTaskDescription[taskType]
  }

  /**
   * Returns a enumerator value indicating the type of operation (intended debugging purposes)
   * @type {RenderTaskType}
   */
  get type()
  {
    return this._type
  }

  /**
   * Returns a textual description of the task type (intended for debugging purposes)
   * @type {String}
   */
  get description()
  {
    return this._description
  }

  /**
   * Invokes the procedure stored by this task
   * @param {Renderer} renderer The renderer responsible for calling this method
   */
  run(renderer)
  {
    this._task(renderer)
  }

  /**
   * Takes an instance of {@link module:Engine/ecs/Scene.Scene} and parses it, returning a sequence of operations to be
   * executed by the renderer. This method is not normally called directly. Instead, the scene object is passed to
   * {@link Renderer#enqueue}, which calls this method in turn.
   * @param {Scene} scene The scene to parse into render tasks
   * @returns {RenderTask[]}
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
 * Given an entity, retrieves all its associated components that are required for rendering, namely those of the `types`
 * array defined above.
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
 * Given an entity state object, as produced by `getEntityState`, produces a sequence of `RenderTask` elements for the
 * associated `SceneNode`.
 * @private
 */
function getNodeTasks(nodeState)
{
  const shader    = nodeState[keyFrom(ShaderProgram)]
  const camera    = nodeState[keyFrom(Camera)]
  const light     = nodeState[keyFrom(Light)]
  const transform = nodeState[keyFrom(Transform)]
  const texture2D = nodeState[keyFrom(Texture2D)]
  const material  = nodeState[keyFrom(Material)]
  const mesh      = nodeState[keyFrom(Mesh)]

  const tasks = []

  if (shader)
  {
    const cb = renderer => renderer.setShader(shader).useShader()
    tasks.push(new RenderTask(cb, RenderTaskType.USE_SHADER))
  }

  if (camera)
  {
    const cb = renderer => {
      const gl = renderer.context
      camera.aspect = gl.canvas.width / gl.canvas.height

      renderer.shader.setBlockUniforms(renderer.context, {
        'Matrix.view'       : camera.lookat,
        'Matrix.projection' : camera.perspective,
      })
    }

    tasks.push(new RenderTask(cb, RenderTaskType.SET_CAMERA))
  }

  if (light)
  {
    const cb = renderer => {
      renderer.shader.setBlockUniforms(renderer.context, {
        'Light.position' : light.position,
        'Light.colour'   : light.colour,
      })
    }

    tasks.push(new RenderTask(cb, RenderTaskType.SET_LIGHT))
  }

  if (transform)
  {
    const cb = renderer => {
      renderer.shader.setUniforms(renderer.context, {
        'model_matrix': transform.worldTransform
      })
    }

    tasks.push(new RenderTask(cb, RenderTaskType.SET_TRANSFORM))
  }

  if (texture2D)
  {
    const cb = renderer => texture2D.bind(renderer.context)
    tasks.push(new RenderTask(cb, RenderTaskType.USE_TEXTURE_2D))
  }

  if (material)
  {
    const cb = renderer => {
      renderer.shader.setUniforms(renderer.context, {
        'material.ambient'   :  material.ambient,
        'material.diffuse'   :  material.diffuse,
        'material.specular'  :  material.specular,
        'material.shininess' : [material.shininess],
      })
    }

    tasks.push(new RenderTask(cb, RenderTaskType.SET_MATERIAL))
  }

  if (mesh)
  {
    const cb = renderer => mesh.draw(renderer.context)
    tasks.push(new RenderTask(cb, RenderTaskType.DRAW_MESH))
  }

  return tasks
}
