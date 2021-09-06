import { mat4,
         quat,
         vec3,
         vec4                } from 'gl-matrix'
import { BasicShader,
         BasicTextureShader,
         Camera,
         Light,
         Material,
         Mesh,
         MeshData,
         Renderer,
         ShaderProgram,
         Transform,
         VertexAttributeType } from '../../engine/gfx/all'
import { Texture2D           } from '../../engine/gfx/WebGL/Texture2D'
import { Entity,
         Query,
         Scene,
         SceneNode,
         System,
         Tag                 } from '../../engine/ecs/all'
import   * as WebGL            from '../../engine/gfx/WebGL/utilities'


import  { model as sphere    } from '../meshes/SphereMesh'
import  { model as plane     } from '../meshes/PlaneMesh'


class PlaneTag extends Tag {}
class SphereTag extends Tag {}


export function MakeScene(gl)
{
  const scene  = new Scene

  ;[
    Camera,
    Light,
    Material,
    Mesh,
    PlaneTag,
    SceneNode,
    ShaderProgram,
    SphereTag,
    Texture2D,
    Transform,
  ].forEach(scene.registerComponentType.bind(scene))

  // -------------------------------------------------------------------------------------------------------------------
  // Shader Init & Config
  //

  const basicShader   = new BasicShader(gl, 3)
  const textureShader = new BasicTextureShader(gl, 3)

  // We'll choose basicShader to be the 'designated' shader, and handle shared (uniform block) buffer managment
  // See documentation for further explanation
  basicShader.createUniformBlockSetters(gl)
  textureShader.updateUniformBlockSetters(gl, basicShader)

  // -------------------------------------------------------------------------------------------------------------------
  // Scene Root
  //
  const e0 = new Entity
  scene.addEntity(e0)

  const n0 = new SceneNode

  const camera = new Camera
  camera.setLookat({ eye: [0, 15, 25], up: [0, 1, 0], at: [0, 0, 0] })
        .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const l0 = new Light
  l0.setPosition([-10, 2, 10])
    .setColour([1, 0, 0])

  const l1 = new Light
  l1.setPosition([0, 2, 0])
    .setColour([0, 1, 0])

  const l2 = new Light
  l2.setPosition([10, 2, -10])
    .setColour([0, 0, 1])

  scene.setComponent(e0, n0)
  scene.setComponent(e0, basicShader)
  scene.setComponent(e0, camera)
  scene.setComponent(e0, [l0, l1, l2])

  // -------------------------------------------------------------------------------------------------------------------
  // Plane Node
  //
  {
    const e = new Entity
    scene.addEntity(e)

    const n = new SceneNode
    n0.addChild(n)

    const t = new Transform

    const data = new MeshData({
      indices: plane.indices,
      primtype: gl.TRIANGLES,
      attributes: [
        {
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
          data: plane.positions,
        },
        {
          type: VertexAttributeType.NORMALS,
          size: 3,
          format: gl.FLOAT,
          data: plane.normals,
        },
        {
          type: VertexAttributeType.UVCOORDS,
          size: 2,
          format: gl.FLOAT,
          data: plane.uvcoords,
        },
      ],
    })
    const mesh = new Mesh({ gl, data, textureShader })

    const c = {
      ambient:  [0.0, 0.0, 0.0],
      diffuse:  [1.0, 1.0, 1.0],
      specular: [0.7, 0.7, 0.7],
      shininess: 5,
    }

    const m = new Material
    m.setAmbient   (c.ambient  )
     .setDiffuse   (c.diffuse  )
     .setSpecular  (c.specular )
     .setShininess (c.shininess)

    const texture = new Texture2D(gl, '/assets/textures/checkerboard.png')

    scene.setComponent(e, textureShader)
    scene.setComponent(e, n)
    scene.setComponent(e, t)
    scene.setComponent(e, m)
    scene.setComponent(e, texture)
    scene.setComponent(e, mesh)
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Sphere Nodes
  //
  {
    const sphereTag = new SphereTag

    const data = new MeshData({
      indices: sphere.indices,
      primtype: gl.TRIANGLES,
      attributes: [
        {
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
          data: sphere.positions,
        },
        {
          type: VertexAttributeType.NORMALS,
          size: 3,
          format: gl.FLOAT,
          data: sphere.normals,
        },
      ]
    })

    const mesh = new Mesh({ gl, data, basicShader })

    const colour = {
      ambient:  [0.0, 0.0, 0.0],
      diffuse:  [0.9, 0.9, 0.9],
      specular: [0.7, 0.7, 0.7],
      shininess: 64,
    }

    const m = new Material
    m.setAmbient   (colour.ambient  )
     .setDiffuse   (colour.diffuse  )
     .setSpecular  (colour.specular )
     .setShininess (colour.shininess)

    const sphereCount = 8
    const TWO_PI      = Math.PI * 2
    const radius      = 8
    const theta       = TWO_PI / sphereCount

    Array(sphereCount).fill().forEach((_, i) => {

      const e = new Entity
      scene.addEntity(e)

      const n = new SceneNode
      n0.addChild(n)

      const t = new Transform
      const x = radius * Math.cos(i * theta)
      const z = radius * Math.sin(i * theta)
      t.setTranslation([x, 1, z])

      scene.setComponent(e, basicShader)
      scene.setComponent(e, n)
      scene.setComponent(e, t)
      scene.setComponent(e, m)
      scene.setComponent(e, mesh)
      scene.setComponent(e, sphereTag)
    })
  }

  // -------------------------------------------------------------------------------------------------------------------
  // System updates
  //

  { // Update local transforms
    const w = Math.PI/8

    const update = (dt, transform, tag) =>
    {
      const angle = w*dt/1000
      transform.translation = vec3.rotateY([], transform.translation, [0,0,0], angle)
    }

    const query  = new Query(Transform, SphereTag).run(scene)
    const system = new System(query, update)

    scene.addSystem(system)
  }


  { // Update world transforms
    const update = (dt, node, transform) =>
    {
      if (node.parent)
      {
        const parentTransform = scene.getComponent(node.parent, Transform)
        transform.worldTransform = mat4.mul(mat4.create(), parentTransform.worldTransform, transform.localTransform)
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


  // -------------------------------------------------------------------------------------------------------------------
  // Done
  //

  return scene
}
