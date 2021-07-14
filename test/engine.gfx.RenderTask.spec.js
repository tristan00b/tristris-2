import {
  Entity,
  keyFrom,
  Query,
  Scene,
  System,
} from '../app/scripts/engine/ecs/all'

import {
  Camera,
  Light,
  Material,
  RenderTask,
  SceneNode,
  Transform
} from '../app/scripts/engine/gfx/all'

import { RenderTaskType } from '../app/scripts/engine/gfx/RenderTask'

import { ShaderProgram } from '../app/scripts/engine/gfx/ShaderProgram'
jest.mock('../app/scripts/engine/gfx/ShaderProgram')

import { Mesh } from '../app/scripts/engine/gfx/Mesh'
jest.mock('../app/scripts/engine/gfx/Mesh')


describe('RenderTask', () => {

  /* ---------------------------------------------------------------------------------------------------------------- *\

    Test structure*:

             0         <--- (shader, tx, camera, light)
            / \
           /   \
          /     \
         1       2     <--- (tx), (tx)
        / \     / \
       /   \   /   \
      3     4 5     6  <--- (tx, mat, mesh), (tx, mat, mesh), (tx mat, mesh), (tx, mat, mesh)

    *Does not represent typical usage (E.G. Meshes are not restricted to being included in leaf nodes, nor shaders to
    the root node. It also does not necessarilly make sense to have nodes with just transforms)

  \* ---------------------------------------------------------------------------------------------------------------- */

  const scene = new Scene

  ;[
    Camera,
    Light,
    Material,
    Mesh,
    RenderTask,
    SceneNode,
    ShaderProgram,
    Transform
  ].forEach(Type => scene.registerComponentType(Type))


  Array(/* entity count */ 7).fill().map(_ => new Entity)
    .forEach(e => {
      scene.addEntity(e)
      scene.setComponent(e, new SceneNode)
    })


  const e = scene.entities
  const n = scene.getComponentsOfType(SceneNode)


  n[0].addChild(n[1])    //        0
      .addChild(n[2])    //       / \
                         //      /   \
  n[1].addChild(n[3])    //     /     \
      .addChild(n[4])    //    1       2
                         //   / \     / \
  n[2].addChild(n[5])    //  /   \   /   \
      .addChild(n[6])    // 3     4 5     6


  // Set entity 0 components (shader, tx, camera, light)
  scene.setComponent(e[0], new ShaderProgram)
  scene.setComponent(e[0], new Camera)
  scene.setComponent(e[0], new Light)
  scene.setComponent(e[0], new Transform)

  // Set entity 1 components (tx)
  scene.setComponent(e[1], new Transform)

  // Set entity 2 components (tx)
  scene.setComponent(e[2], new Transform)

  // Set entity 3 components (tx, mat, mesh)
  scene.setComponent(e[3], new Transform)
  scene.setComponent(e[3], new Material)
  scene.setComponent(e[3], new Mesh)

  // Set entity 4 components (tx, mat, mesh)
  scene.setComponent(e[4], new Transform)
  scene.setComponent(e[4], new Material)
  scene.setComponent(e[4], new Mesh)

  // Set entity 5 components (tx mat, mesh)
  scene.setComponent(e[5], new Transform)
  scene.setComponent(e[5], new Material)
  scene.setComponent(e[5], new Mesh)

  // Set entity 6 components (tx, mat, mesh)
  scene.setComponent(e[6], new Transform)
  scene.setComponent(e[6], new Material)
  scene.setComponent(e[6], new Mesh)


  describe('RenderTask.parseScene', () => {

    it('Generates a list of render tasks', () => {
      const tasks = RenderTask.parseScene(scene)

      // n0
      expect(tasks[ 0].type).toBe(RenderTaskType.USE_SHADER)
      expect(tasks[ 1].type).toBe(RenderTaskType.USE_CAMERA)
      expect(tasks[ 2].type).toBe(RenderTaskType.USE_LIGHT)
      expect(tasks[ 3].type).toBe(RenderTaskType.SET_TRANSFORM)

      // n1
      expect(tasks[ 4].type).toBe(RenderTaskType.SET_TRANSFORM)

      // n2
      expect(tasks[ 5].type).toBe(RenderTaskType.SET_TRANSFORM)

      // n3
      expect(tasks[ 6].type).toBe(RenderTaskType.SET_TRANSFORM)
      expect(tasks[ 7].type).toBe(RenderTaskType.SET_MATERIAL)
      expect(tasks[ 8].type).toBe(RenderTaskType.DRAW_MESH)

      // n4
      expect(tasks[ 9].type).toBe(RenderTaskType.SET_TRANSFORM)
      expect(tasks[10].type).toBe(RenderTaskType.SET_MATERIAL)
      expect(tasks[11].type).toBe(RenderTaskType.DRAW_MESH)

      // n5
      expect(tasks[12].type).toBe(RenderTaskType.SET_TRANSFORM)
      expect(tasks[13].type).toBe(RenderTaskType.SET_MATERIAL)
      expect(tasks[14].type).toBe(RenderTaskType.DRAW_MESH)

      // n6
      expect(tasks[15].type).toBe(RenderTaskType.SET_TRANSFORM)
      expect(tasks[16].type).toBe(RenderTaskType.SET_MATERIAL)
      expect(tasks[17].type).toBe(RenderTaskType.DRAW_MESH)
    })
  })
})
