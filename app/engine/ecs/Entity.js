/**
 * A class for representing in-game objects (aka entities)
 */
export class Entity
{
  constructor()
  {
    Object.defineProperties(
      this,
      defineEntityPropertyDescriptors( generateUniqueId() ))
  }

  /**
   * Creates an instance of `Entity` with an arbitrary value for its ID rather than automatically generating a unique
   * ID. This method is intended for creating references to entities that already exist within a scene instead of
   * creating entirely new ones.
   * @param {Number} id The value to use for the component's ID
   * @returns {Entity}
   */
  static fromId(id)
  {
    return Object.create(
      Entity.prototype,
      defineEntityPropertyDescriptors(id))
  }

  /**
   * The unique ID indexing this instance
   * @type {Number}
   * @readonly
   */
  get id()
  {
    return this._id
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
   * Reports whether the entity is currently enabled or disabled
   * @type {Boolean}
   */
  get isEnabled()
  {
    return this._isEnabled
  }
}


/**
 * Abstracts property initialization from `Entity.constructor` to enable creation of entities with arbitrary ID's via
 * `Entity.fromId`
 * @private
 */
function defineEntityPropertyDescriptors(id)
{
  return {
    _id: {
      value: `${id}`,
      writable: false,
      configurable : false,
    },
    _isEnabled: {
      value: true,
      configurable: false,
    }
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
