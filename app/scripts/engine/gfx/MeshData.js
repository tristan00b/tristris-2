import { MakeConstEnumerator, MakeErrorType, MakeLogger } from '../utilities'
import * as gl from './WebGL/constants'


/** @module Engine/gfx/MeshData */


/**
 * Enumerates the types of vertex attributes
 * @enum {Number}
 * @property {Number} POSITION
 * @property {Number} COLOUR
 * @property {Number} NORMAL
 * @property {Number} TEXTURE
 * @property {Number} NUM_ATTRIBUTE_TYPES
 * @readonly
 */
export const VertexAttributeType = MakeConstEnumerator('VertexAttributeType', [
  'POSITION',
  'COLOUR',
  'NORMAL',
  'TEXTURE',
  'NUM_ATTRIBUTE_TYPES',
])


/**
 * This type is for documentation purpostes. An `AttributeDescriptor` describes how to interpret mesh vertex array data
 * provided to an instance of `MeshData`. An `AttributeDescriptor` object does not need to be instantiated, rather a
 * any object containing the properties described below can be used.
 * @typedef AttributeDescriptor
 * @property {VertexAttributeType} type The type of attribute (e.g. `VertexAttributeType.POSITION`)
 * @property {Number} size The number of components per attribute (between 1-4 inclusive)
 * @property {Number} format Specifies how to interpret the components' data type (e.g. gl.FLOAT)
 */


/**
 * This type is for documentation purposes. A `VertexData` object describes the data provided to an instance of
 * `MeshData` so that memory on the graphics card can be correctly allocated when later on. A `VertexData object does
 * not need to be instantiated, rather any object containing the properties described below can be used.
 * @typedef VertexArrayData
 * @property {Number[]} vertices Vertex data (1-4 components) placed sequentially into a 1D array
 * @property {Number[]} [indices] Indices into the vertex data array
 * @property {Number} [args.primtype=gl.TRIANGLES] The type of primitive used to interpret the mesh data
 * @property {AttributeDescriptor} attrib The vertex attributes specified by the mesh data
 */


/**
 * Container class for specifying mesh data
 */
export class MeshData
{
  /**
   * @param {...VertexArrayData} data
   */
  constructor(...data)
  {
    this._data = []
    data.forEach(d => {

      const { vertices, indices, primtype, attrib } = d

      this.checkVertices(vertices)
      this.checkAttribute(attrib)

      this._data[attrib.type] = {
        vertices,
        indices,
        primtype,
        attrib,
      }
    })

    //this[Symbol.iterator] = this._data[Symbol.iterator].bind(this._data)
  }

  /**
   *
   * @param {Number} index Integer index into the arrayof VertexArrayData objects
   */
  at(index)
  {
    return this._data[index]
  }

  /**
   * Description
   * @generator
   * @yields {VertexArrayData} The next VertexArrayData
   */
  *[Symbol.iterator]()
  {
    let elements = [...this._data],
        elem = null

    while (elem = elements.shift())
    {
      yield elem
    }
  }

  /**
   * Checks the vertices and returns them if they are found to be well-formed (`vertices` is neither `null|undefined` nor empty)
   * @param {Number[]} vertices
   * @throws {MeshDataError} Throws when `vertices` is undefined or empty
   */
  checkVertices(vertices)
  {
    vertices?.length ?? throw new MeshDataError('requires vertex data')
  }

  /**
   * Checks the attribute, returning if is it found to be well-formed:
   * - The attribute specifies both a `type` and a `size` attribute
   * - The `type` corresponds to an attribute of the `VertexAttributeType` enum
   * - The `size` specifies a number of components from 1 to 4 inclusive
   * @param {{ type: VertexAttributeType, size: Number }} attrib
   */
  checkAttribute(attrib)
  {
    attrib?.type ?? throw new MeshDataError('attributes require a type to be defined')
    attrib?.type >= 0 && attrib?.type < VertexAttributeType.NUM_ATTRIBUTE_TYPES ||
      throw new MeshDataError(`invalid attribute type specified (received type: ${attrib?.type})`)

    attrib?.size ?? throw new MeshDataError('attributes require a size to be defined')
    attrib?.size > 0 && attrib?.size <= 4 ||
      throw new MeshDataError(`attribute size limited to between 1 and 4 components (received size: ${attrib?.size}`)
  }

  // /**
  //  * Checks the attributes and returns them if they are found to be well-formed:
  //  * - Each attribute specifies a `type` and a `size` attribute
  //  * - The `type` corresponds to an attribute of the `VertexAttributeType` enum
  //  * - The `size` specifies a number of components from 1 to 4 inclusive
  //  * @param {Array.<{ type: VertexAttributeType, size: Number}>} attribs
  //  * @returns {Array.<{ type: VertexAttributeType, size: Number}>} attribs
  //  * @throws {MeshDataError} Throws when the attribute check has failed
  //  */
  // checkAttributes(attribs)
  // {
  //   attribs?.length || throw new MeshDataError('vertex attributes must be specified')

  //   attribs.forEach(({ type, size }) => {
  //     type ?? throw new MeshDataError('attributes require a type to be defined')
  //     size ?? throw new MeshDataError('attributes require a size to be defined')

  //     type >= 0 && type < VertexAttributeType.NUM_ATTRIBUTE_TYPES ||
  //       throw new MeshDataError(`invalid attribute type specified (received type: ${type})`)

  //     size > 0 && size <= 4 ||
  //       throw new MeshDataError(`attribute size limited to between 1 and 4 components (received size: ${size}`)
  //   })

  //   return attribs
  // }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(MeshData)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const MeshDataError = MakeErrorType(MeshData)
