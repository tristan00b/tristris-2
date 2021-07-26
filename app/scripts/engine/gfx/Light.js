import { vec3 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * A simple point-source light
 */
export class Light
{
  constructor()
  {
    this._position = [0, 1, 1]
    this._colour   = [1, 1, 1]
  }

  /**
   * Gets the position of the light
   * @type {external:vec3}
   * @default [0,1,1]
   */
  get position()
  {
    return this._position
  }

  set position(position)
  {
    this._position = position
  }

  /**
   * Sets the position of the light
   * @param {external:vec3} position
   * @returns {Light} The `this` object reference
   */
  setPosition(position)
  {
    this.position = position
    return this
  }

  /**
   * Gets the colour of the light
   * @type {external:vec3}
   * @default [1,1,1]
   */
  get colour()
  {
    return this._colour
  }

  set colour(colour)
  {
    this._colour = colour
  }

  /**
   * Sets the colour of the light
   * @param {external:vec3} colour
   * @returns {Light} The `this` object reference
   */
  setColour(colour)
  {
    this.colour = colour
    return this
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
