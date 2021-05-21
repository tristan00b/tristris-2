import { mat4 } from 'gl-matrix'
import { MeshData } from './MeshData'
import { MakeErrorType, MakeLogger } from './Util'
import * as WebGL from './WebGL'
import WebGLUtil from './webgl/WebGLUtil'

const BufferT = Object.freeze({
  VERTEX_BUFFER : 0,
  INDEX_BUFFER  : 1,
  NUM_BUFFERS   : 2
})

export class Mesh
{
  constructor({ gl, data, shader, usage=gl.STATIC_DRAW })
  {
    const { vertices, indices, primtype } = data

    this._vao = new WebGL.VertexArray(gl)
    this._vao.bind(gl)
      this._vbo = []
      this._vbo[BufferT.VERTEX_BUFFER] = new WebGL.ArrayBuffer(gl)
      this._vbo[BufferT.VERTEX_BUFFER].bind(gl)
      this._vbo[BufferT.VERTEX_BUFFER].data(gl, new Float32Array(vertices), usage)

      if (indices)
      {
        this._vbo[BufferT.INDEX_BUFFER] = new WebGL.ElementArrayBuffer(gl)
        this._vbo[BufferT.INDEX_BUFFER].bind(gl)
        this._vbo[BufferT.INDEX_BUFFER].data(gl, new Uint32Array(indices), usage)
        this._draw = gl => gl.drawElements(primtype, indices.length, gl.UNSIGNED_INT, 0)
      }
      else
      {
        this._draw = gl => gl.drawArrays(primtype, 0, vertices.length)
      }

      this._vao.enableAttribute(gl, shader.attributes.position)
      this._vao.defineAttributePointer(gl, shader.attributes.position, 3, gl.FLOAT)
    this._vao.unbind(gl)
  }

  draw(gl)
  {
    this._vao.bind(gl)
    this._draw(gl)
    this._vao.unbind(gl)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
 const Log = MakeLogger(Mesh)


 /**
  * @private
  * @see {@link util.MakeErrorType}
  */
 const MeshError = MakeErrorType(Mesh)
