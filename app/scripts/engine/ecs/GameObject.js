import { generateUniqueId } from '../utilities'

/**
 * Wraps an ID representing a single game element (object)
 */
export class GameObject
{
  /**
   * Create a new instance with a unique ID
   */
  constructor()
  {
    this._id = generateUniqueId()
  }

  /**
   * The unique ID indexing this instance
   * @type {Number}
   */
  get id()
  {
    return this._id
  }
}
