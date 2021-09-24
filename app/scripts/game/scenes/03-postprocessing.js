import { mat4,
         quat                } from 'gl-matrix'
import { Entity,
         Query,
         Scene,
         SceneNode,
         System,
         Tag                 } from '../../engine/ecs/all'
import { BasicShader,
         BasicTextureShader,
         Camera,
         Light,
         Material,
         MeshData,
         Renderable,
         RenderTask,
         ShaderProgram,
         Transform,
         VertexAttributeType } from '../../engine/gfx/all'
import { Texture2D           } from '../../engine/gfx/WebGL/Texture2D'
import { quad                } from '../../engine/gfx/meshes/quad'

import { model as cubeModel   } from '../meshes/CubeMesh'
import { model as sphereModel } from '../meshes/SphereMesh'


class CubeTag extends Tag {}
class SphereTag extends Tag {}


export function MakeScene(gl)
{
  const scene = new Scene

  ;[
    Camera,
    CubeTag,
    Light,
    Material,
    Renderable,
    SceneNode,
    ShaderProgram,
    SphereTag,
    Texture2D,
    Transform,
  ].forEach(scene.registerComponentType.bind(scene))

  const lightCount    = 4
  const basicShader   = new BasicShader(gl, lightCount)
  const textureShader = new BasicTextureShader(gl, lightCount)

  basicShader.createUniformBlockSetters(gl)
  textureShader.updateUniformBlockSetters(gl, basicShader)

  const c = new Camera
  c.setLookat({ eye: [0, 15, 25], up: [0, 1, 0], at: [0, 0, 0] })
   .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const e0 = new Entity
  const root = new SceneNode

  scene.addEntity(e0)
  scene.setComponent(e0, c)
  scene.setComponent(e0, root)
  scene.setComponent(e0, basicShader)

  { // Plane -----------------------------------------------------------------------------------------------------------
    const e = new Entity

    const n = new SceneNode
    root.addChild(n)

    const t = new Transform
    t.setRotation(quat.fromEuler([], -90, 0, 0))
     .setScale([10, 10, 1])

     const m = new Material
     m.setAmbient   ([0.0, 0.0, 0.0])
      .setDiffuse   ([0.9, 0.9, 0.9])
      .setSpecular  ([1.0, 1.0, 1.0])
      .setShininess (32)

    const r = new Renderable(gl, quad(-1, -1, 2, 2), textureShader)

    const texture = Texture2D.fromURL(gl, '/assets/textures/checkerboard.png')

    scene.addEntity(e)
    scene.setComponent(e, n)
    scene.setComponent(e, t)
    scene.setComponent(e, m)
    scene.setComponent(e, r)
    scene.setComponent(e, texture)
    scene.setComponent(e, textureShader)
  }

  { // Cubes -----------------------------------------------------------------------------------------------------------
    const cubeTag = new CubeTag
    const count = 3

    ;[...Array(count)].forEach((_, index) =>{

      const e = new Entity
      scene.addEntity(e)

      const n = new SceneNode
      root.addChild(n)

      // stack cubes top of each other
      const scale  = 1/(index+1)
      const height = Array(index+1).fill()
        .map((_, i) => 1/(i+1)/* this height */ + ((i===0)?0:(1/i))/* previous height */)
        .reduce((acc, v) => acc+v, 0) + index*0.2

      const t = new Transform
      t.setTranslation([0, height, 0])
       .setScale([scale, scale, scale])

      const m = new Material
      m.setAmbient   ([0.1,  0.1,  0.1 ])
       .setDiffuse   ([0.9,  0.9,  0.9 ])
       .setSpecular  ([1.0,  1.0,  1.0 ])
       .setShininess (64)

      const data = new MeshData({
        primtype: cubeModel.primtype,
        indices: cubeModel.indices,
        attributes: [
          {
            type: VertexAttributeType.POSITIONS,
            size: 3,
            format: gl.FLOAT,
            data: cubeModel.positions,
          },
          {
            type: VertexAttributeType.NORMALS,
            size: 3,
            format: gl.FLOAT,
            data: cubeModel.normals,
          },
          {
            type: VertexAttributeType.UVCOORDS,
            size: 2,
            format: gl.FLOAT,
            data: cubeModel.uvcoords,
          }
        ]
      })

      const r = new Renderable(gl, data, basicShader)

      scene.setComponent(e, n)
      scene.setComponent(e, t)
      scene.setComponent(e, m)
      scene.setComponent(e, r)
      scene.setComponent(e, basicShader)
      scene.setComponent(e, cubeTag)
    })

    { // Update Cubes --------------------------------------------------------------------------------------------------
      const w = 0.5*Math.PI/1000
      let index = -1
      let time  = 0

      const update = (dt, transform/*, tag */) =>
      {
        index = (index + 1) % count
        time += dt
        const angle = w*dt * Math.pow(-1, index)
        transform.setRotation(quat.rotateY([], transform.rotation, angle))
      }

      const query  = new Query(Transform, CubeTag).run(scene)
      const system = new System(query, update)
      scene.addSystem(system)
    }
  }

  { // Sphere-Lights ---------------------------------------------------------------------------------------------------
    const sphereTag = new SphereTag
    const count  = lightCount
    const lights = []

    const colours = [
      [0, 0, 1],
      [1, 1, 0],
      [0, 1, 0],
      [1, 0, 0]
    ]

    ;[...Array(count)].forEach((_, index) => {
      const e = new Entity
      scene.addEntity(e)

      const n = new SceneNode
      root.addChild(n)

      const t = new Transform
      t.setTranslation([0,1,0])

      const m = new Material
      m.setAmbient   (colours[index])
       .setDiffuse   ([0,0,0])
       .setSpecular  ([0,0,0])
       .setShininess (1)

      const data = new MeshData({
        primtype: sphereModel.primtype,
        indices: sphereModel.indices,
        attributes: [
          {
            type: VertexAttributeType.POSITIONS,
            size: 3,
            format: gl.FLOAT,
            data: sphereModel.positions,
          },
          {
            type: VertexAttributeType.NORMALS,
            size: 3,
            format: gl.FLOAT,
            data: sphereModel.normals,
          },
        ]
      })

      const r = new Renderable(gl, data, basicShader)

      const l = new Light
      l.setColour(colours[index])
       .setPosition([0,1,0])
      lights.push(l)

      scene.setComponent(e, n)
      scene.setComponent(e, t)
      scene.setComponent(e, m)
      scene.setComponent(e, r)
      scene.setComponent(e, sphereTag)
    })

    scene.setComponent(e0, lights)

    { // Updaate sphere-lights -----------------------------------------------------------------------------------------
      const a = 10 - 20/16
      const halfPI = Math.PI/2
      const w = 0.1*Math.PI/1000/count

      { // Update shperes
        let index = -1
        let time  = 0

        const update = (dt, transform /*, SphereTag */) =>
        {
          index = (index + 1) % count
          time += dt
          let [x, y, z] = transform.translation
          x = a*Math.cos(w*time + (index * halfPI))
          z = a*Math.sin(w*time + (index * halfPI))
          transform.translation = [x, y, z]
        }

        const query = new Query(Transform, SphereTag).run(scene)
        const system = new System(query, update)
        scene.addSystem(system)
      }

      { // Update lights
        let index = -1
        let time  = 0

        const update = (dt, lights) => {
          lights.forEach(l => {
            time += dt
            index = (index+1) % count
            let [x, y, z] = l.position
            x = a*Math.cos(w*time + (index * halfPI))
            z = a*Math.sin(w*time + (index * halfPI))
            l.position = [x, y, z]
          })
        }

        const query  = new Query(Light).run(scene)
        const system = new System(query, update)
        scene.addSystem(system)
      }
    }
  }

  { // Update world transforms -----------------------------------------------------------------------------------------
    const update = (dt, node, transform) =>
    {
      if (node.parent)
      {
        const parentTransform = scene.getComponent(node.parent, Transform)
        transform.worldTransform = mat4.mul([], parentTransform.worldTransform, transform)
      }
      else
      {
        transform.worldTransform = transform.localTransform
      }
    }

    const query  = new Query(SceneNode, Transform).run(scene)
    const system = new System(query, update)
    scene.addSystem(system)
  }

  return scene
}
