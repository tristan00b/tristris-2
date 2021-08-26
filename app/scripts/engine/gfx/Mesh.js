import * as WebGL from './WebGL/all'
import { mat4 } from 'gl-matrix'
import { MeshData, VertexAttributeType } from './MeshData'
import { MakeConstEnumerator, MakeErrorType, MakeLogger } from '../utilities'

/**
 * Enumerates the types of attribute buffers (note the correspondence to `VertexAttributeType` is exploited when saving
 * WebGL buffer objects to `Mesh._buffers`)
 * @enum {Number}
 * @property {Number} POSITIONS
 * @property {Number} NORMALS
 * @property {Number} COLOURS
 * @property {Number} UVCOORDS
 * @property {Number} INDEX
 * @property {Number} NUM_BUFFER_TYPES
 * @readonly
 * @private
 */
const BufferType = MakeConstEnumerator('BufferType', [
  ...Object.keys(VertexAttributeType).filter(key => key !== 'NUM_ATTRIBUTE_TYPES'),
  'INDEX',
  'NUM_BUFFER_TYPES'
])


/**`
 * Acquires and configures buffers on the graphics card for drawing the specified `MeshData`, and provides a generic
 * draw method for the renderer to call
 */
export class Mesh
{
  /**
   * @param {Object} args
   * @param {external:WebGL2RenderingContext} args.gl WebGL2 rendering context
   * @param {MeshData} args.data The data to acquire buffers on the graphics card for
   * @param {ShaderProgram} args.shader Used to enable the vertex attributes described by `data`
   */
  constructor({ gl, data, shader })
  {
    this._vao = new WebGL.VertexArray(gl)
    this._vao.bind(gl)
    this._buffers = []

    ;[...VertexAttributeType].forEach(type => {

      const attribute = data.at(type)
      if (attribute)
      {
        this._buffers[attribute.type] = makeVertexAttributeBuffer(gl, attribute.data)
        this._vao.enableAttribute(gl, attribute.type)
        this._vao.defineAttributePointer(gl, attribute.type, attribute.size, attribute.format)
      }
    })

    const { primtype, indices } = data

    if (indices)
    {
      this._buffers[BufferType.INDEX_BUFFER] = makeIndexBuffer(gl, data.indices)

      const drawCount = indices.length
      this._draw = gl => gl.drawElements(primtype, drawCount, gl.UNSIGNED_INT, 0)
    }
    else
    {
      const drawCount = data.attributes[0].data.length
      this._draw = gl => gl.drawArrays(primtype, 0, drawCount)
    }

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
 * @todo document
 * @private
 */
function makeVertexAttributeBuffer(gl, data)
{
  const buf = new WebGL.ArrayBuffer(gl)
  buf.bind(gl)
  buf.data(gl, new Float32Array(data), gl.STATIC_DRAW)
  return buf
}


/**
 * @todo document
 * @private
 */
function makeIndexBuffer(gl, data)
{
  const buf = new WebGL.ElementArrayBuffer(gl)
  buf.bind(gl)
  buf.data(gl, new Uint32Array(data), gl.STATIC_DRAW)
  return buf
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
