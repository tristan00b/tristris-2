import { mat4,
         quat,
         vec3                  } from 'gl-matrix'
import { Entity,
         Query,
         Scene,
         SceneNode,
         System,
         Tag                   } from '../../engine/ecs/all'
import { Camera,
         Light,
         Material,
         MeshData,
         Renderable,
         RenderTask,
         ShaderProgram,
         Transform,
         VertexAttributeType   } from '../../engine/gfx/all'
import { Texture2D             } from '../../engine/gfx/WebGL/Texture2D'
import { BasicMRTShader        } from '../../engine/gfx/shaders/BasicMRTShader'
import { BasicTextureMRTShader } from '../../engine/gfx/shaders/BasicTextureMRTShader'
import { PlayerController      } from '../../engine/PlayerController'

import { model as cubeMesh     } from '../meshes/CubeMesh'
import { model as planeMesh    } from '../meshes/PlaneMesh'
import { model as sphereMesh   } from '../meshes/SphereMesh'


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
    PlayerController,
    Renderable,
    SceneNode,
    ShaderProgram,
    SphereTag,
    Texture2D,
    Transform,
  ].forEach(scene.registerComponentType.bind(scene))

  const lightCount = 4
  const shaders    = [
    new BasicMRTShader(gl, lightCount),
    new BasicTextureMRTShader(gl, lightCount),
  ]

  const c = new Camera
  c.setLookat({ eye: [0, 15, 25] })
   .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const e0 = new Entity
  const root = new SceneNode

  const player = new PlayerController(gl, c)

  scene.addEntity(e0)
  scene.setComponent(e0, c)
  scene.setComponent(e0, player)
  scene.setComponent(e0, root)
  scene.setComponent(e0, shaders[0])

  { // Plane -----------------------------------------------------------------------------------------------------------
    const e = new Entity

    const n = new SceneNode
    root.addChild(n)

    const t = new Transform

    const m = new Material
     m.setAmbient   ([0.0, 0.0, 0.0])
      .setDiffuse   ([0.9, 0.9, 0.9])
      .setSpecular  ([1.0, 1.0, 1.0])
      .setShininess (32)

    const texture = Texture2D.fromURL(gl, '/assets/textures/checkerboard.png')

    const data = new MeshData({
      primtype: planeMesh.primtype,
      indices: planeMesh.indices,
      attributes: [
        {
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
          data: planeMesh.positions
        },
        {
          type: VertexAttributeType.NORMALS,
          size: 3,
          format: gl.FLOAT,
          data: planeMesh.normals
        },
        {
          type: VertexAttributeType.UVCOORDS,
          size: 2,
          format: gl.FLOAT,
          data: planeMesh.uvcoords
        },
      ]
    })

    const r = new Renderable(gl, data, shaders[1])

    scene.addEntity(e)
    scene.setComponent(e, n)
    scene.setComponent(e, t)
    scene.setComponent(e, m)
    scene.setComponent(e, texture)
    scene.setComponent(e, r)
    scene.setComponent(e, shaders[1])
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
      m.setAmbient   ([0.9,  0.9,  0.9])
       .setDiffuse   ([1.9,  1.9,  1.9])
       .setSpecular  ([1.0,  1.0,  1.0])
       .setShininess (32)

      const mesh = new MeshData({
        primtype: cubeMesh.primtype,
        indices: cubeMesh.indices,
        attributes: [
          {
            type: VertexAttributeType.POSITIONS,
            size: 3,
            format: gl.FLOAT,
            data: cubeMesh.positions,
          },
          {
            type: VertexAttributeType.NORMALS,
            size: 3,
            format: gl.FLOAT,
            data: cubeMesh.normals,
          },
          {
            type: VertexAttributeType.UVCOORDS,
            size: 2,
            format: gl.FLOAT,
            data: cubeMesh.uvcoords,
          }
        ]
      })

      const r = new Renderable(gl, mesh, shaders[0])

      scene.setComponent(e, n)
      scene.setComponent(e, t)
      scene.setComponent(e, m)
      scene.setComponent(e, r)
      scene.setComponent(e, shaders[0])
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

    const diffuseColours = [
      [0,    0,    1],
      [0.76, 0.76, 0],
      [0,    1,    0],
      [1,    0,    0]
    ]

    const lightColours = [
      [0,    0,    7],
      [0.6,  0.6,  0],
      [0,    0.7,  0],
      [1.9,  0,    0]
    ]

    ;[...Array(count)].forEach((_, index) => {
      const e = new Entity
      scene.addEntity(e)

      const n = new SceneNode
      root.addChild(n)

      const t = new Transform
      t.setTranslation([0,1,0])

      const m = new Material
      m.setAmbient   (diffuseColours[index])
       .setDiffuse   ([0,0,0])
       .setSpecular  ([0,0,0])
       .setShininess (1)

      const mesh = new MeshData({
        primtype: sphereMesh.primtype,
        indices: sphereMesh.indices,
        attributes: [
          {
            type: VertexAttributeType.POSITIONS,
            size: 3,
            format: gl.FLOAT,
            data: sphereMesh.positions,
          },
          {
            type: VertexAttributeType.NORMALS,
            size: 3,
            format: gl.FLOAT,
            data: sphereMesh.normals,
          },
        ]
      })

      const r = new Renderable(gl, mesh, shaders[0])

      const l = new Light
      l.setColour(lightColours[index])
       .setPosition([0,1,0])
      lights.push(l)

      scene.setComponent(e, n)
      scene.setComponent(e, t)
      scene.setComponent(e, m)
      scene.setComponent(e, r)
      scene.setComponent(e, sphereTag)
    })

    scene.setComponent(e0, lights)

    { // Update sphere-lights ------------------------------------------------------------------------------------------
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

  { // Update PlayerController -----------------------------------------------------------------------------------------
    const update = (dt, player, camera) =>
    {
      let playerMoved = false
      const distance = dt * 0.04 // ms * m/ms
      const position = vec3.create()

      if (player.isMovingForward)
      {
        position[2] -= distance
        playerMoved  = true
      }

      if (player.isMovingLeft)
      {
        position[0] -= distance
        playerMoved  = true
      }

      if (player.isMovingBack)
      {
        position[2] += distance
        playerMoved  = true
      }

      if (player.isMovingRight)
      {
        position[0] += distance
        playerMoved  = true
      }

      if (player.isMovingUp)
      {
        position[1] += distance
        playerMoved  = true
      }

      if (player.isMovingDown)
      {
        position[1] -= distance
        playerMoved  = true
      }

      if (playerMoved)
      {
        console.log(`t: ${dt}, d: ${distance}`)

        const M = mat4.invert([], camera.lookat)
        const newPos = vec3.transformMat4([], position, M)
        const offset = vec3.sub([], newPos, camera.eye)

        camera.eye = newPos
        camera.at  = vec3.add([], camera.at, offset)
      }
    }

    const query  = new Query(PlayerController, Camera).run(scene)
    const system = new System(query, update)
    scene.addSystem(system)
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
