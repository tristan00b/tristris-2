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


  //--------------------------------------------------------------------------------------------------------------------
  // Scene Root
  //
  const e0 = new Entity
  scene.addEntity(e0)

  const n0 = new SceneNode
  const shader = new BasicShader(gl)

  const camera = new Camera
  camera.setLookat({ eye: [0, 15, 25], up: [0, 1, 0], at: [0, 0, 0] })
        .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const light = new Light
  light.setPosition([0, 4, -20])
       .setColour([1, 1, 1])

  scene.setComponent(e0, n0)
  scene.setComponent(e0, shader)
  scene.setComponent(e0, camera)
  scene.setComponent(e0, light)

  // -------------------------------------------------------------------------------------------------------------------
  // Plane Node
  //
  {
    const e = new Entity
    scene.addEntity(e)

    const n = new SceneNode
    n0.addChild(n)

    const t = new Transform

    const shader = new BasicTextureShader(gl)

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
    const mesh = new Mesh({ gl, data, shader })

    const c = {
      ambient:  [0.0, 0.0, 0.0],
      diffuse:  [1.0, 1.0, 1.0],
      specular: [0.7, 0.7, 0.7],
      shininess: 64,
    }

    const m = new Material
    m.setAmbient   (c.ambient  )
     .setDiffuse   (c.diffuse  )
     .setSpecular  (c.specular )
     .setShininess (c.shininess)

    const texture = new Texture2D(gl, '/assets/textures/uvgrid.png')

    scene.setComponent(e, shader)
    scene.setComponent(e, camera)
    scene.setComponent(e, light)

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

    const mesh = new Mesh({ gl, data, shader })

    const colour = {
      ambient:  [0.0, 0.0, 0.0],
      diffuse:  [0.0, 0.0, 0.9],
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

      scene.setComponent(e, shader)
      scene.setComponent(e, camera)
      scene.setComponent(e, light)

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