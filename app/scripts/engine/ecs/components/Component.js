import {
  defineImmutableProperty,
  MakeErrorType,
  MakeLogger,
} from '../../utilities'


/**
 * This type is for documentation purposes and includes any type whose base class is `Component`, (e.g. `TagComponent`)
 * @class ComponentType
 * @extends Component
 */


/**
 * Component base class (not intended to be used directly)
 */
export class Component
{
  /**
   * @param {Boolean} [enabled=true] Start with componenent initially enabled or disabled
   */
  constructor(enabled = true)
  {
    this._isEnabled = enabled
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  static get isComponent() { return true }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isComponent() { return true }

  /**
   * @type {String}
   * @readonly
   */
  get name() { return this.constructor.name }

  /**
   * Enables calling instance methods on subclasses of Component
   */
  enable() { this._isEnabled = true }

  /**
   * Disables calling instance methods on subclasses of Component (doing so will result in a warning being printed to
   * the console)
   */
  disable() { this._isEnabled = false }

  /**
   * Gets the enabled/disabled state of the component
   * @type {Boolean}
   * @readonly
   */
  get isEnabled() { return this._isEnabled }

  /**
   * Performs no work--Override in subclass
   * @param {Number} dt The time ellapsed since the previous call to `update`
   */
  update(dt) { }
}

defineImmutableProperty({
  object: Component,
  name: 'isComponentType',
  value: true,
  enumerable: true
})
