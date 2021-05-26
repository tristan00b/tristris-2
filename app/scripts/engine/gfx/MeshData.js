import { MakeErrorType, MakeLogger } from '../utilities'
import * as gl from './WebGL/constants'


/** @module Engine/gfx/MeshData */


/**
 * Enumerates the types of vertex attributes
 * @enum {Number}
 * @property {Number} POSITION       0
 * @property {Number} COLOUR         1
 * @property {Number} NORMAL         2
 * @property {Number} TEXTURE        3
 * @property {Number} MAX_ATTRIBUTES 4
 * @readonly
 */
export const VertexAttributeType = {}

Object.defineProperties(VertexAttributeType, {
  POSITION       : { value: 0, writeable: false, enumerable: true },
  COLOUR         : { value: 1, writeable: false, enumerable: true },
  NORMAL         : { value: 2, writeable: false, enumerable: true },
  TEXTURE        : { value: 3, writeable: false, enumerable: true },
  MAX_ATTRIBUTES : { value: 4, writeable: false, enumerable: true },
})


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

      type >= 0 && type < VertexAttributeType.MAX_ATTRIBUTES ||
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
