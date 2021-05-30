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
 * Container class for specifying mesh data
 */
export class MeshData
{
  /**
   * @param {Object}   args
   * @param {Number[]} args.vertices
   * @param {{ type: VertexAttributeType, size: Number }} args.attribs The vertex attributes specified by the mesh data
   * @param {Number[]} [args.indices=null] An array of indices into the vertex array
   * @param {Number}   [args.primtype] The type of primitive used to interpret the mesh data
   * @param {Boolean}  [args.interleaved=false] (default: false)
   * @param {Number}   [args.order=gl.CCW]
   */
  constructor({ vertices, indices, primtype, attribs, interleaved, order })
  {
    this.vertices    = this.checkVertices(vertices)
    this.attribs     = this.checkAttributes(attribs)

    this.indices     = indices     ?? null
    this.primtype    = primtype    ?? gl.TRIANGLES
    this.interleaved = interleaved ?? false
    this.order       = order       ?? gl.CCW
  }

  /**
   * Checks the vertices and returns them if they are found to be well-formed (`vertices` is neither `null|undefined` nor empty)
   * @param {Number[]} vertices
   * @returns {Number[]} vertices
   */
  checkVertices(vertices)
  {
    vertices?.length ?? throw new MeshDataError('requires vertex data')
    return vertices
  }

  /**
   * Checks the attributes and returns them if they are found to be well-formed:
   * - Each attribute specifies a `type` and a `size` attribute
   * - The `type` corresponds to an attribute of the `VertexAttributeType` enum
   * - The `size` specifies a number of components from 1 to 4 inclusive
   * @param {Array.<{ type: VertexAttributeType, size: Number}>} attribs
   * @returns {Array.<{ type: VertexAttributeType, size: Number}>} attribs
   */
  checkAttributes(attribs)
  {
    attribs?.length || throw new MeshDataError('vertex attributes must be specified')

    attribs.forEach(({ type, size }) => {
      type ?? throw new MeshDataError('attributes require a type to be defined')
      size ?? throw new MeshDataError('attributes require a size to be defined')

      type >= 0 && type < VertexAttributeType.NUM_ATTRIBUTE_TYPES ||
        throw new MeshDataError(`invalid attribute type specified (received type: ${type})`)

      size > 0 && size <= 4 ||
        throw new MeshDataError(`attribute size limited to between 1 and 4 components (received size: ${size}`)
    })

    return attribs
  }
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
