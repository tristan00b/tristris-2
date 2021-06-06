import { mat4 } from 'gl-matrix'

import {
  BasicShader,
  Camera,
  Light,
  Material,
  Mesh,
  MeshData,
  Renderer,
  SceneGraph,
  SceneNode,
  VertexAttributeType,
  WebGL,
} from '../../engine/gfx/all'

import * as model from '../models/sphere'

export function JustSpheresScene(gl, sphereCount=4)
{
  const { positions, normals } = model

  const data = new MeshData({
    vertices: positions.data,
    indices:  positions.indices,
    primtype: gl.TRIANGLES,
    attrib:   { type: VertexAttributeType.POSITION, size:3, format: gl.FLOAT }
  },
  {
    vertices: normals.data,
    indices:  normals.indices,
    primtype: gl.TRIANGLES,
    attrib:   { type: VertexAttributeType.NORMAL, size: 3, format: gl.FLOAT }
  })

  const shader = new BasicShader(gl)

  const mesh   = new Mesh({ gl, data, shader })

  const camera = new Camera({ lookat: {eye: [0, 0, 10], up: [0, 1, 0]} })
  const light  = new Light({ position: [0.2, 0.3, -1], colour: [1, 1, 1] })

  const m0 = new Material({ ambient: [0.05, 0.05, 0.05, 1.0], diffuse: [0.8, 0, 0, 1], specular: [0.7, 0.7, 0.7, 1], shininess: 64 })
  const m1 = new Material({ ambient: [0.05, 0.05, 0.05, 1.0], diffuse: [0, 0.8, 0, 1], specular: [0.7, 0.7, 0.7, 1], shininess: 64 })

  const n0 = new SceneNode({ shader })
  const n1 = new SceneNode({ mesh, material: m0 })
  const n2 = new SceneNode({ mesh, material: m1 }).setWorldTransform(mat4.fromTranslation(mat4.create(), [-1, -0.5, 0]))

  n0.addChildren(n1, n2)

  const scene = new SceneGraph({ root: n0, camera, light })

  return scene
}
