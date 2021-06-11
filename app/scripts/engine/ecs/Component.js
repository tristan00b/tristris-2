import {
  getPropertyDescriptors,
  MakeErrorType,
  MakeLogger,
  setNameProperty,
  stringstrip
} from '../utilities'

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
   * Enables calling instance methods on subclasses of Component
   */
  enable()
  {
    this._isEnabled = true
  }

  /**
   * Disables calling instance methods on subclasses of Component (doing so will result in a warning being printed to
   * the console)
   */
  disable()
  {
    this._isEnabled = false
  }

  /**
   * Gets the enabled/disabled state of the component
   * @type {Boolean}
   * @readonly
   */
  get isEnabled()
  {
    return this._isEnabled
  }

  /**
   * `NOP` - override in subclass
   * @param {Number} dt The time ellapsed since the previous call to `update`
   */
  update(dt) { }
}


/**
 * Wraps a function such that it is only called when `this.isEnabled` is `true`
 * @param {function} fn The function to wrap
 * @returns {function} The wrapped function
 * @private
 */
function execIfEnabled(fn)
{
  return setNameProperty({
    name: fn.name,
    object:
      function (...args) {
        return this.isEnabled ? fn.call(this, ...args) : Log.warn('component disabled!')
      }
  })
}


/**
 * Takes the property descriptors of an object (class) and wraps its methods
 * @param {Object} properties property descriptors for the class on which to wrap its member functions
 * @returns {Object} The mutated property descriptors
 * @private
 */
function wrapMethods(properties)
{
  const newprops = {}
  Object.entries(properties).forEach( ([prop, attrs]) =>
  {
    newprops[prop] = attrs

    if (attrs.value && typeof attrs.value === 'function')
      newprops[prop].value = execIfEnabled(attrs.value)
  })

  return newprops
}


/**
 * Takes a reference to a class and makes it a subclass of `Component`, whose methods are wrapped such that they will
 * not be called when the component is disabled
 * @param {Object} cls The class with which to extend `Component`
 * @returns {Object} A new subclass of component
 *
 * @example
 * const _MyComponent = class {...} // leading/trailing underscores will be removed from class name in derived class
 * const MyComponent = MakeComponent(_MyComponent) // `MyComponent` is a subclass of `Component` with methods wrapped
 *
 * const myInstance = new MyComponent(...)
 *
 * myInstance instanceof Component    // => true
 * myInstance instanceof MyComponent  // => true
 * myInstance instanceof _MyComponent // => false
 *
 * myInstance.fun()       // => original method `fun` is called
 * myInstance.disable()   // => component is disabled, instance methods will not execute when called
 * myInstance.fun()       // => original method `fun` is not called; a warning is printed to the console
 * ntInstance.staticfun() // => static methods are not wrapped, this method will execute regardless
 */
export function MakeComponent(cls)
{
  function inherit(baseclass, subclass)
  {
    const __derived = class extends baseclass
    {
      constructor(...args)
      {
        super(...args)
        Object.assign(this, new subclass(...args))
      }
    }

    { // Class properties
      const props = getPropertyDescriptors({ object: subclass, filterkeys: ['constructor', 'prototype'] })
      Object.defineProperties(__derived, props)
      setNameProperty({ object: __derived, name: stringstrip(cls.name, '_') })
    }

    { // Instance properties
      const bprops = getPropertyDescriptors({ object: Component.prototype, filterkeys: ['constructor'] })
      const sprops = getPropertyDescriptors({ object: cls.prototype,       filterkeys: ['constructor'] })
      const wprops = wrapMethods(sprops)
      const newProperties = Object.fromEntries([...Object.entries(bprops), ...Object.entries(wprops)])
      Object.defineProperties(__derived.prototype, newProperties)
    }

    return __derived
  }

  return inherit(Component, cls)
}


/**
 * @see {@link module:Util.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Component)


 /**
  * @see {@link module:Util.MakeErrorType}
  * @private
  */
 const ComponentError = MakeErrorType(Component)
