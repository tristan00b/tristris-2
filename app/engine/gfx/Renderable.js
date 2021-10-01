import { MeshData,
         VertexAttributeType  } from './MeshData'
import { MakeConstEnumerator,
         MakeErrorType,
         MakeLogger           } from '../utilities'
import { ArrayBuffer,
         ElementArrayBuffer,
         Program,
         VertexArray          } from './WebGL/all'

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
  'INDICES',
  'NUM_BUFFER_TYPES'
])

/**
 * @private
 */
export const VertexAttributeTypeNameMap = Object.freeze({
  [VertexAttributeType.POSITIONS] : 'in_vertex_position',
  [VertexAttributeType.NORMALS]   : 'in_vertex_normal',
  [VertexAttributeType.UVCOORDS]  : 'in_vertex_uvcoord',
  [VertexAttributeType.COLOURS]   : 'in_vertex_colour',
})

/**
 * Given a vertex attribute type, returns the name as is expected to be found within a given shader program
 * @param {VertexAttributeType} type The vertex attribute type
 * @returns {String} The corresponding vertex attribute name
 * @private
 */
function vertexAttributeName(type)
{
  return VertexAttributeTypeNameMap[type]
}


/**
 * Given a mesh object and a shader program, acquires and configures gpu buffers, and provides a generic interface for
 * rendering.
 */
export class Renderable
{
  /**
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {MeshData} data The data to acquire buffers on the graphics card for
   * @param {ShaderProgram} shader Used to enable the vertex attributes described by `data`
   * @todo Cache attribute indices
   */
  constructor(gl, data, shader)
  {
    this._attributeIndices = {}
    this._buffers = []

    this._vao = new VertexArray(gl)
    this._vao.bind(gl)

    // Configure VAO for the given mesh data
    ;[...VertexAttributeType].forEach(type => {
      const name      = vertexAttributeName(type)
      const index     = Program.getAttributeLocation(gl, shader.program, name)
      const attribute = data.at(type)

      if (index === -1) return // the shader does not reference this attribute
      if (!attribute  ) return // there isn't a descriptor for this attribute

      this._attributeIndices[name] = index // cache the attr index
      this._buffers[attribute.type] = makeVertexAttributeBuffer(gl, attribute.data)
      this._vao.enableAttribute(gl, index)
      this._vao.defineAttributePointer(gl, index, attribute.size, attribute.format)
    })

    // Define the draw command
    const { primtype, indices } = data
    if (indices)
    {
      this._buffers[BufferType.INDICES] = makeIndexBuffer(gl, data.indices)

      const drawCount = indices.length
      this._draw = gl => gl.drawElements(primtype, drawCount, gl.UNSIGNED_INT, 0)
    }
    else
    {
      const positions = data.at(VertexAttributeType.POSITIONS)
      const drawCount = Math.floor(positions.data.length / positions.size)
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

  // /**
  //  * Enables the attribute for rendering (N.B. attributes are)
  //  * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
  //  * @param {String} name The name of the attribute to enable
  //  * @param {ShaderProgram} shader
  //  * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray}
  //  */
  // enableAttribute(gl, name)
  // {
  //   const index = this._attributeIndices[name]

  //   if (index)
  //   {
  //     this._vao.enableAttribute(gl, index)
  //   }
  //   else
  //   {
  //     const sname = shader?.constructor?.name
  //     Log.warn(`failed to enable attribute: "${name}" not found in shader "${sname}"`)
  //   }
  // }

  // /**
  //  * Disables the attribute for rendering
  //  * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
  //  * @param {String} name The name of the attribute to distable
  //  * @param {ShaderProgram} shader
  //  * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/disableVertexAttribArray}
  //  */
  // disableAttribute(gl, name)
  // {
  //   const index = this._attributeIndices[name]

  //   if (index)
  //   {
  //     this._vao.disableAttribute(gl, index)
  //   }
  //   else
  //   {
  //     const sname = shader?.constructor?.name
  //     Log.warn(`failed to disable attribute: "${name}" not found in shader "${sname}"`)
  //   }
  // }
}


/**
 * Given a vertex attribute descriptor (see {@link module:Engine/gfx/MeshData.VertexAttributeDescriptor}), determines
 * the draw count (i.e. the number of vertices ) whenever `size` divides evenly into `data.length`.
 * Otherwise a value of `-1` is returned.
 * @param {VertexAttributeDescriptor} descriptor The descriptor to calculate the draw count from.
 * @returns {Number} The draw count, or `-1`
 *   length, otherwise `-1`
 * @private
 */
function getVertexArrayDrawCount(descriptor)
{
  const l = arr.data.length
  const s = arr.size
  return (l % s === 0) ? Math.floor(l/s) : -1
}

/**
 * @todo document
 * @private
 */
function makeVertexAttributeBuffer(gl, data)
{
  const buffer = new ArrayBuffer(gl)
  buffer.bind(gl)
  buffer.data(gl, new Float32Array(data), gl.STATIC_DRAW)
  return buffer
}


/**
 * @todo document
 * @private
 */
function makeIndexBuffer(gl, data)
{
  const buffer = new ElementArrayBuffer(gl)
  buffer.bind(gl)
  buffer.data(gl, new Uint32Array(data), gl.STATIC_DRAW)
  return buffer
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Renderable)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const RenderableError = MakeErrorType(Renderable)
