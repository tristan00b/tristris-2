import * as WebGL from './WebGL/all'
import { mat4 } from 'gl-matrix'
import { MeshData } from './MeshData'
import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * Enumerates the types of WebGL Array Buffers
 * @enum {Number}
 * @property {Number} VERTEX_BUFFER 0
 * @property {Number} INDEX_BUFFER  1
 * @property {Number} NUM_BUFFERS   2
 * @readonly
 * @private
 */
const BufferType = {}

Object.defineProperties(BufferType, {
  VERTEX_BUFFER : { value: 0, writable: false, enumerable: true },
  INDEX_BUFFER  : { value: 1, writable: false, enumerable: true },
  NUM_BUFFERS   : { value: 2, writable: false, enumerable: true },
})


/**
 * Acquires and configures buffers on the graphics card for drawing the specified `MeshData`, and provides a generic
 * draw method for the renderer to call
 */
export class Mesh
{
  /**
   * @param {Object} args
   * @param {external:WebGL2RenderingContext} args.gl WebGL2 rendering context
   * @param {MeshData} args.data The MeshData to acquire buffers on the graphics card for
   * @param {ShaderProgram} args.shader Used to enable the vertex attributes described by `data`
   */
  constructor({ gl, data, shader })
  {
    const { vertices, indices, primtype, attribs } = data

    this._vao = new WebGL.VertexArray(gl)
    this._vao.bind(gl)
      this._vbo = []
      this._vbo[BufferType.VERTEX_BUFFER] = new WebGL.ArrayBuffer(gl)
      this._vbo[BufferType.VERTEX_BUFFER].bind(gl)
      this._vbo[BufferType.VERTEX_BUFFER].data(gl, new Float32Array(vertices), gl.STATIC_DRAW)

      if (indices)
      {
        this._vbo[BufferType.INDEX_BUFFER] = new WebGL.ElementArrayBuffer(gl)
        this._vbo[BufferType.INDEX_BUFFER].bind(gl)
        this._vbo[BufferType.INDEX_BUFFER].data(gl, new Uint32Array(indices), gl.STATIC_DRAW)

        this._draw = gl => gl.drawElements(primtype, indices.length, gl.UNSIGNED_INT, 0)
      }
      else
      {
        this._draw = gl => gl.drawArrays(primtype, 0, vertices.length)
      }

      /** @todo Move this functionality to `ShaderProgram` */
      attribs.forEach(attr => {
        this._vao.enableAttribute(gl, attr.type)
        this._vao.defineAttributePointer(gl, attr.type, attr.size, gl.FLOAT)
      })

    this._vao.unbind(gl)
  }

  /**
   * Provides a generic call syntax for the renderer to use to trigger drawing of mesh data
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   */
  draw(gl)
  {
    this._vao.bind(gl)
    this._draw(gl)
    this._vao.unbind(gl)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Mesh)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const MeshError = MakeErrorType(Mesh)
