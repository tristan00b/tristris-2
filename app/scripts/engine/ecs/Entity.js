import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * Wraps an ID representing a single game element (object)
 */
export class Entity
{
  /**
   * The unique ID indexing this instance
   * @type {Number}
   */

  /** */
  constructor()
  {
    Object.defineProperties(this, {
      _id: {
        writable: false,
        configurable: false,
        enumerable: false,
        value: `${ generateUniqueId() }`,
      },
      id: {
        configurable: false,
        enumerable: true,
        get: function () { return this._id },
        set: undefined
      }
    })

    this._isEnabled = true
  }

  /**
   * Signals that this entity should be included in subsequent update cycles
   */
  enable()
  {
    this._isEnabled = true
  }

  /**
   * Signals that this entity should be excluded in subsequent update cycles
   */
  disable()
  {
    this._isEnabled = false
  }

  /**
   * Tells the current enabled/disabled state
   * @type {Boolean}
   */
  get isEnabled()
  {
    return this._isEnabled
  }
}


/**
 * Returns a unique integer value with each call
 * @generator
 * @function
 * @returns {Number}
 * @example
 * // do call like a normal function
 * generateUniqueId() // => 1
 * generateUniqueId() // => 2
 * generateUniqueId() // => 3
 *
 * // do not use generator semantics
 * generateUniqueId.next().value // => error!
 * @private
 */
 const generateUniqueId = (function()
 {
   const gen = (function* () {
     let uid = 0
     while(true)
       yield uid++
   })()

   return () => gen.next().value
 })()


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Entity)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const EntityError = MakeErrorType(Entity)
