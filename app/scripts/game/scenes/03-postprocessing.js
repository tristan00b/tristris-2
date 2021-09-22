import { mat4,
         quat                } from 'gl-matrix'
import { Entity,
         Scene,
         SceneNode           } from '../../engine/ecs/all'
import { BasicTextureShader,
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

export function MakeScene(gl)
{
  const scene = new Scene

  ;[
    Camera,
    Light,
    Material,
    Renderable,
    SceneNode,
    ShaderProgram,
    Texture2D,
    Transform,
  ].forEach(scene.registerComponentType.bind(scene))

  const lightCount = 1
  const s = new BasicTextureShader(gl, lightCount)
  s.createUniformBlockSetters(gl)

  const c = new Camera
  c.setLookat({ eye: [0, 15, 25], up: [0, 1, 0], at: [0, 0, 0] })
   .setPerspective({ aspect: gl.canvas.width/gl.canvas.height  })

  const l = new Light
  l.setPosition([0, 2, -7])
   .setColour([0.5, 0.5, 0.6])

  const e = new Entity
  const n = new SceneNode

  const t = new Transform
  t.setRotation(quat.fromEuler([], -90, 0, 0))
   .setScale([10, 10, 1])

   // normally would calculated in an ECS System
  t.worldTransform = t.localTransform

  const m = new Material
  m.setAmbient   ([0.0, 0.0, 0.0])
   .setDiffuse   ([0.9, 0.9, 0.9])
   .setSpecular  ([1.0, 1.0, 1.0])
   .setShininess (6)

  const r = new Renderable(gl, quad(-1, -1, 2, 2), s)

  const texture = Texture2D.fromURL(gl, '/assets/textures/checkerboard.png')

  scene.addEntity(e)
  scene.setComponent(e, s)
  scene.setComponent(e, c)
  scene.setComponent(e, [l])

  scene.setComponent(e, n)
  scene.setComponent(e, t)
  scene.setComponent(e, m)
  scene.setComponent(e, r)
  scene.setComponent(e, texture)

  return scene
}
