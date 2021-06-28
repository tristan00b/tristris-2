import { Component } from '../Component'
import { defineImmutableProperty } from '../../utilities'


/**
 * This class is for documentation purposes and includes any type whose base class is `TagComponent`
 * @class TagComponentType
 * @extends TagComponent
 */


/**
 * Used for grouping components by tag type
 * @example
 * const components = [...]
 * const pinkElephants = components.filter(c => c.isTagComponent && c.name == 'PinkElephant')
 */
export class TagComponent extends Component
{
  /**
   * @type {Boolean}
   * @readonly
   */
   static get isTagComponent()
   {
     return true
   }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isTagComponent()
  {
    return true
  }
}
