import { mat4 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from './Util'
import * as WebGL from './WebGL'
import WebGLUtil from './webgl/WebGLUtil'

export class Model
{
  constructor({ gl, mesh, shader, transform })
  {
    Object.assign(this, {
      mesh,
      shader,
      transform: (transform ?? mat4.create())
    })

    this.vao = new WebGL.VertexArray(gl)
    this.vao.bind(gl)
      this.buffer = new WebGL.ArrayBuffer(gl)
      this.buffer.bind(gl)
      this.buffer.data(gl, new Float32Array(mesh.vertices), gl.STATIC_DRAW)

      this.indices = new WebGL.ElementArrayBuffer(gl)
      this.indices.bind(gl)
      this.indices.data(gl, new Uint32Array(mesh.indices), gl.STATIC_DRAW)

      this.vao.enableAttribute(gl, shader.attribute.position)
      this.vao.defineAttributePointer(gl, shader.attribute.position, 3, gl.FLOAT)
    this.vao.unbind(gl)
  }

  draw(gl)
  {
    this.vao.bind(gl)

    gl.drawElements(this.mesh.type, this.mesh.indices.length, gl.UNSIGNED_INT, 0)

    this.vao.unbind(gl)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
 var Log = MakeLogger(Model)


 /**
  * @private
  * @see {@link util.MakeErrorType}
  */
 const ModelError = MakeErrorType(Model)
