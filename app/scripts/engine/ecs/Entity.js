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
  static create()
  {
    const Entity = class { }

    const en = Object.create(Entity, {
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

    return en
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
       yield ++uid
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
