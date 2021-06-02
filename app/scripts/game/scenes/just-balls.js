import { mat4 } from 'gl-matrix'

import {
  BasicShader,
  Camera,
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
  const camera = new Camera

  camera.lookat = {
    eye: [0, 0, 10],
    up:  [0, 1,  0],
  }
  camera.perspective = {}

  const n0 = new SceneNode({ shader })
  const n1 = new SceneNode({ mesh })
  const n2 = new SceneNode({ mesh }).setWorldTransform(mat4.fromTranslation(mat4.create(), [-1, -0.5, 0]))

  n0.addChildren(n1, n2)

  const scene = new SceneGraph({ root: n0, camera })

  /** @todo refactor aspect ratio handling */
  window.addEventListener('resize', camera.setAspect.bind(camera, gl.canvas))

  return scene
}
