import { MakeErrorType, MakeLogger } from './Util'
import * as gl from './webgl/constants/common'


export const VertexAttributes = Object.freeze({
  POSITION       : 0,
  COLOUR         : 1,
  NORMAL         : 2,
  TEXTURE        : 3,
  MAX_ATTRIBUTES : 4,
})


export class MeshData
{
  constructor({ vertices, indices, primtype, attribs, interleaved, order })
  {
    this.vertices    = this.checkVertices(vertices)
    this.attribs     = this.checkAttributes(attribs)

    this.indices     = indices     ?? null
    this.primtype    = primtype    ?? null
    this.interleaved = interleaved ?? false
    this.order       = order       ?? gl.CCW
  }

  checkVertices(vertices)
  {
    vertices?.length ?? throw new MeshDataError('requires vertex data')
    return vertices
  }

  checkAttributes(attribs)
  {
    attribs?.length || throw new MeshDataError('vertex attributes must be specified')

    attribs.forEach(({ type, size }) => {
      type ?? throw new MeshDataError('attributes require a type to be defined')
      size ?? throw new MeshDataError('attributes require a size to be defined')

      type >= 0 && type < VertexAttributes.MAX_ATTRIBUTES ||
        throw new MeshDataError(`invalid attribute type specified (received type: ${type})`)

      size > 0 && size <= 4 ||
        throw new MeshDataError(`attribute size limited to between 1 and 4 components (received size: ${size}`)
    })

    return attribs
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
 const Log = MakeLogger(MeshData)


 /**
  * @private
  * @see {@link util.MakeErrorType}
  */
 const MeshDataError = MakeErrorType(MeshData)
