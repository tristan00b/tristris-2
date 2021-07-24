import { mat4,
         quat,
         vec3,
         vec4                } from 'gl-matrix'
import { model               } from '../meshes/CubeMesh'
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
    Transform,
  ].forEach(scene.registerComponentType.bind(scene))


  //--------------------------------------------------------------------------------------------------------------------
  // Scene Root
  //
  const e0 = new Entity
  scene.addEntity(e0)

  const n0 = new SceneNode
  scene.setComponent(e0, n0)

  const shader = new BasicShader(gl)
  scene.setComponent(e0, shader)

  const camera = new Camera({
    lookat:      { eye: [0, 0, 10], up: [0, 1, 0], at: [0, 0, 0] },
    perspective: { aspect: gl.canvas.width/gl.canvas.height      }
  })

  scene.setComponent(e0, camera)

  const light = new Light({ position: [3, 2, -2], colour: [1, 1, 1] })
  scene.setComponent(e0, light)


  // -------------------------------------------------------------------------------------------------------------------
  // Spheres Nodes
  //

  //{ // loop n times
    const s0 = new Entity
    scene.addEntity(s0)

    const n1 = new SceneNode
    n0.addChild(n1)

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

    const colour = {
      ambient:  [0.0, 0.0, 0.0, 1.0],
      diffuse:  [0.9, 0.0, 0.0, 1.0],
      specular: [0.7, 0.7, 0.7, 1.0],
      shininess: 64,
    }

    const mesh      = new Mesh({ gl, data, shader })
    const material  = new Material(colour)
    const transform = new Transform

    const rotation  = quat.fromEuler(quat.create(),
      180/Math.PI * Math.PI/3,
      180/Math.PI * Math.PI/4,
      180/Math.PI * Math.PI/5)

    transform.setTranslation([0, 0, -5]).setRotation(rotation)//.setScale([0.5, 0.5, 0.5])
    transform.worldTransform = transform.localTransform

    scene.setComponent(s0, n1)
    scene.setComponent(s0, material)
    scene.setComponent(s0, mesh)
    scene.setComponent(s0, transform)
  //}

  const update = (dt, node, transform) =>
  {
    if (node.parent)
    {
      const parent = scene.getComponent(node.parent, Transform)
      transform.worldTransform =
        mat4.mul(mat4.create(), parent.worldTransform, transform.localTransform)
    }
  }

  const query  = new Query(scene, SceneNode, Transform)
  const system = new System(query, update)

  scene.addSystem(system)

  return scene
}
