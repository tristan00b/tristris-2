import { mat4,
         quat,
         vec3,
         vec4                } from 'gl-matrix'
import { model               } from '../meshes/SphereMesh'
import { BasicShader,
         Camera,
         Light,
         Material,
         Mesh,
         MeshData,
         Renderer,
         ShaderProgram,
         Transform,
         VertexAttributeType } from '../../engine/gfx/all'
import { Entity,
         Query,
         Scene,
         SceneNode,
         System,
         Tag                 } from '../../engine/ecs/all'
import   * as WebGL            from '../../engine/gfx/WebGL/utilities'


class SphereTag extends Tag {}


export function MakeScene(gl)
{
  const scene  = new Scene

  ;[
    Camera,
    Light,
    Material,
    Mesh,
    SceneNode,
    ShaderProgram,
    SphereTag,
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
  camera.setLookat({ eye: [0, 0, 25], up: [0, 1, 0], at: [0, 0, 0] })
        .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const light = new Light
  light.setPosition([0, 10, -20])
       .setColour([1, 1, 1])

  scene.setComponent(e0, n0)
  scene.setComponent(e0, shader)
  scene.setComponent(e0, camera)
  scene.setComponent(e0, light)


  // -------------------------------------------------------------------------------------------------------------------
  // Spheres Nodes
  //

  const data = new MeshData(
    {
      indices: model.indices,
      primtype: gl.TRIANGLES,
      attributes: [
        {
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
          data: model.positions,
        },
        {
          type: VertexAttributeType.NORMALS,
          size: 3,
          format: gl.FLOAT,
          data: model.normals,
        },
      ]
    }
  )
  const mesh = new Mesh({ gl, data, shader })

  const colours = [
    { // red
      ambient:  [0.0, 0.0, 0.0, 1.0],
      diffuse:  [0.9, 0.0, 0.0, 1.0],
      specular: [0.7, 0.7, 0.7, 1.0],
      shininess: 64,
    },
    { // green
      ambient:  [0.0, 0.0, 0.0, 1.0],
      diffuse:  [0.0, 0.9, 0.0, 1.0],
      specular: [0.7, 0.7, 0.7, 1.0],
      shininess: 64,
    },
    { // blue
      ambient:  [0.0, 0.0, 0.0, 1.0],
      diffuse:  [0.0, 0.0, 0.9, 1.0],
      specular: [0.7, 0.7, 0.7, 1.0],
      shininess: 64,
    },
  ]

  const sphereCount = [1, 4, 6, 8, 6, 4, 1]
  const levelCount  = sphereCount.length
  const TWO_PI      = Math.PI * 2
  const R           = 10

  const h   = 2*R / (levelCount - 1)

  Array(levelCount).fill().forEach((_, j) => {

    const c = colours[j % colours.length]
    const m = new Material
    m.setAmbient(c.ambient)
     .setDiffuse(c.diffuse)
     .setSpecular(c.specular)
     .setShininess(c.shininess)

    const sphereTag = new SphereTag
    sphereTag.level = j

    const theta = TWO_PI / sphereCount[j]

    const y     = R - j * h
    const phi   = Math.acos(y/R)
    const r     = R * Math.sin(phi)

    Array(sphereCount[j]).fill().forEach((_, i) => {

      const s = new Entity
      scene.addEntity(s)

      const n = new SceneNode
      n0.addChild(n)

      const t = new Transform
      const x = r * Math.cos(i * theta)
      const z = r * Math.sin(i * theta)
      t.setTranslation([x, y, z])

      scene.setComponent(s, n)
      scene.setComponent(s, t)
      scene.setComponent(s, m)
      scene.setComponent(s, mesh)
      scene.setComponent(s, sphereTag)
    })

  })


  // -------------------------------------------------------------------------------------------------------------------
  // System updates
  //

  { // Update local transforms
    const w = Math.PI/8

    const update = (dt, transform, tag) =>
    {
      const angle = Math.pow(-1, tag.level) * w*dt/1000
      transform.translation = vec3.rotateY([], transform.translation, [0,0,0], angle)
      // transform.rotation = quat.rotateY([], transform.rotation, angle)
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
        const parent = scene.getComponent(node.parent, Transform)
        transform.worldTransform = mat4.mul(mat4.create(), parent.worldTransform, transform.localTransform)
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
