import { vec3 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * A simple point-source light
 */
export class Light
{
  constructor({ position, colour } = {})
  {
    this._position = position ? position : [0,  0, -1]
    this._colour   = colour   ? colour   : [1,  1,  1]
  }

  /**
   * @type {external:vec3}
   */
  get position()
  {
    return this._position
  }

  /**
   * @type {external:vec3}
   */
  get colour()
  {
    return this._colour
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Light)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const LightError = MakeErrorType(Light)
