import { MakeErrorType, MakeLogger } from './Util'

export class Mesh
{
  constructor({ vertices, indices, type })
  {
    Object.assign(this, { vertices, indices, type })
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
