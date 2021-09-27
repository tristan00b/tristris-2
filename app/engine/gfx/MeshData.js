import { MakeConstEnumerator, MakeErrorType, MakeLogger } from '../utilities'
import * as gl from './WebGL/constants'


/** @module Engine/gfx/MeshData */


/**
 * Enumerates the types of vertex attributes
 * @type {enum}
 * @property {Number} POSITIONS
 * @property {Number} NORMALS
 * @property {Number} UVCOORDS
 * @property {Number} COLOURS
 * @property {Number} NUM_ATTRIBUTE_TYPES
 * @readonly
 */
export const VertexAttributeType = MakeConstEnumerator('VertexAttributeType', [
  'POSITIONS',
  'NORMALS',
  'UVCOORDS',
  'COLOURS',
  'NUM_ATTRIBUTE_TYPES',
])

/**
 * Provides the specification for a single vertex attribute, e.g. positions, normals, or texels, etc. (For a compplete
 * list of attribute types, see {@link module:Engine/gfx/MeshData.VertexAttributeType}).
 * @typedef VertexAttributeDescriptor
 * @property {VertexAttributeType} type The type of the vertex attribtue
 * @property {Number} size The number of components per vertex (1-4 inclusive)
 * @property {Number} format A constant value specifying how to interpret the data (currently only `gl.FLOAT` and `gl.UNSIGNED_INT` are supported)
 * @property {Number[]} data A 1D buffer containing the data corresponding to `type` (e.g. `[x0, y0, z0, x1, y1, z1, ...]`)
 *
 * @example
 * // VertexAttributeDescriptor does not have a dedicated constructor.
 * // Simply create object including the above properties.
 * const positionsAttribute = {
 *   type:   VertexAttributeType.POSITIONS,
 *   size:   3, // components per vertex
 *   data:   buffer,
 *   format: gl.FLOAT
 * }
 */



/**
 * Container class for specifying mesh data
 */
export class MeshData
{
  /**
   * @private
   */
  defaultAttributeDescriptor = {
    enabled : false,
    size    : 0,
    data    : [],
    format  : gl.FLOAT,
  }

  /**
   * @param {Object} args
   * @param {VertexAttributeDescriptor[]} args.attributes The specification for all attribute data associated with each
   * @param {Number[]} [args.indices] Array of indices for indexing into vertex attributes at draw time
   * @param {Number} [args.primtype=gl.TRIANGLES] The primitive type used to draw the mesh (e.g. gl.TRIANGLES)
   *   vertex of a {@link Mesh}
   * @throws {MeshDataError} Throws on malformed attributes
   */
  constructor({ attributes, indices, primtype})
  {
    this._attrs = []
    this._indices  = indices
    this._primtype = primtype ?? gl.TRIANGLES

    attributes.map(checkAttribute).forEach(attribute => {
      this._attrs[attribute.type] = Object.assign({ enabled: true }, attribute)
    })
  }

  /**
   * Returns the indices if they were provided to the constructor
   * @type {Number[]}
   */
  get indices()
  {
    return this._indices
  }

  /**
   * Returns the primitive type that will be used to draw the mesh (see
   *   {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants#rendering_primitives})
   * @type {Number}
   */
  get primtype()
  {
    return this._primtype
  }

  /**
   * Gets the `VertexAttributeDescriptor` corresponding to `type`
   * @param {VertexAttributeType} type The type of the attribute to get
   * @returns {VertexAttributeDescriptor} Returns the value at `type` if it exist on this `MeshData` instance
   */
  at(type)
  {
    return this._attrs[type]
  }

  /**
   * Disables the attribute for rendering if it exists on this instance
   * @param {VertexAttributeType} type
   */
  disableAttribute(type)
  {
    if (this.isAttributeDefined(type))
    {
      this.at(type).enabled = false
    }
    else
    {
      Log.warn(`Attempted to disable undefined attribute`)
    }
  }

  /**
   * Enables the attribute for rendering if it exists on this instance
   * @param {VertexAttributeType} type
   */
  enableAttribute(type)
  {
    if (this.isAttributeDefined(type))
    {
      this.at(type).enabled = true
    }
    else
    {
      Log.warn(`Attempted to enable undefined attribute`)
    }
  }

  /**
   * Reports whether this instance contains the vertex attributed data for a given vertex attribute type
   * @param {VertexAttributeType} type
   * @returns {Boolean}
   */
  isAttributeDefined(type)
  {

    return !!this.at(type)
  }
}


/**
 * Checks the attribute, returning if is it found to be well-formed:
 * - The attribute specifies both a `type` and a `size` attribute
 * - The `type` corresponds to an attribute of the `VertexAttributeType` enum
 * - The `size` specifies a number of components from 1 to 4 inclusive
 * @param {VertexAttributeDescriptor} attribute
 * @returns {VertexAttributeDescriptor} Returns the attribute descriptor if the check passes
 * @throws {MeshDataError} Throws when the check has failed
 * @private
 */
function checkAttribute(attribute)
{
  const { type, size, format, data } = attribute

  type ?? throw new MeshDataError('attributes require a type property to be defined')
  type >= 0 && type < VertexAttributeType.NUM_ATTRIBUTE_TYPES ||
    throw new MeshDataError(`attribute type must be a type specified by VertexAttributeType (received: ${type})`)

  size ?? throw new MeshDataError('attributes require a size property (number of components) to be defined')
  size > 0 && size <= 4 ||
    throw new MeshDataError(`attribute size must be between 1 and 4 components (received: ${size}`)

  format == gl.FLOAT || format == gl.UNSIGNED_INT ||
    throw new MeshDataError(`attribute format must be either gl.FLOAT or gl.UNSIGNED_INT`)

  Array.isArray(data) ||
    throw new MeshDataError('attributes require a data property to be defined')

  Array.isArray(data) && data.length !== 0 ||
    throw new MeshDataError(`attribute data must be a non-empty array`)

  data.length % size === 0 ||
    throw new MeshDataError(`attribute data must contain a multiple of size elements (got [data.length: ${data?.length}, size: ${size}])`)

  return attribute
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
