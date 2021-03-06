/**
 * Genral utility functions
 * @module Engine/Utilities
 */


/**
 * Limits a given value to the specified range [min, max]
 * @param {Number} val
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function clip(val, min, max)
{
  return Math.max(Math.min(val, max), min)
}


/**
 * Loads the image located at a specified URL
 * @param {String} url The location of the image to load
 * @param {Function(event)} callback a callback to apply when the image has loaded (assigned to Image.onload)
 * @returns {Image}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event}
 */
 export function loadImage(url, callback)
 {
   const image  = new Image
   image.onload = callback
   image.src    = url
   return image
 }


/**
 * Returns a new type `T` derived from of `Error`
 * @param {Type} T The type to derive an error type from
 * @returns {*} A new error type `${T.name}Error`
 */
export function MakeErrorType(T) {
  return class extends Error {
    name = `${T.name}Error`
  }
}


/**
 * Returns a type derived from `Type T`, which prepends `T.name` to log messages
 *
 * @example
 * const Log = MakeLogger(MyType)
 * Log.debug('this is a message') // logs "MyType: this is a log message"
 *
 * @param {Type} T The type to derive from
 * @returns {*} A new logger type `${T.name}Logger`
 */
export function MakeLogger(T) {
  return class {
    name = `${T.name}Logger`

    /**
     * Writes to `console.debug`
     * @param {...any} args
     */
    static debug(...args)
    {
      console.debug(`${T.name}:`, ...args)
    }

    /**
     * Writes to `console.info`
     * @param {...any} args
     */
    static info(...args)
    {
      console.info(`${T.name}:`, ...args)
    }

    /**
     * Writes to console.warn
     * @param {...any} args
     */
    static warn(...args)
    {
      console.warn(`${T.name}:`, ...args)
    }

    /**
     * Writes to console.error
     * @param {...any} args
     */
    static error(...args)
    {
      console.error(`${T.name}:`, ...args)
    }
  }
}


/**
 * Given a name and array of property names, creates constant enumerator of type `enum.<Number>`
 * @param {String}   clsname The name for the new enum type
 * @param {String[]|Object<String, Number>} properties An array of property names or an object with name-value pairs
 */
export function MakeConstEnumerator(clsname, properties)
{
  const enumerable  = true
  const writable    = false
  const name        = [ 'name', { value: clsname } ]
  const haveArray   = isArray(properties)

  const keys =  haveArray ? Object.values(properties) : Object.keys(properties)
  const vals = (haveArray ? Object.keys(properties)   : Object.values(properties)).map(k => parseInt(k))

  const iterator = [
    Symbol.iterator, { value: function* () {
      for (const key in this)
      {
        yield this[key]
      }
    }}
  ]

  const entries = keys.map((key, idx) => [key, { value: vals[idx], enumerable, writable }])
  const descriptors = Object.fromEntries([name, iterator, ...entries])
  return Object.defineProperties({}, descriptors)
}


/**
 * Counts the number of rotations for a given angle (sign preserving)
 * @param {Number} angle The angle in radians
 * @returns {Number} The number of rotations
 */
export function rotations(angle)
{
  return angle / Math.PI / 2
}


/**
 * Rounds a given value to a specified number of decimal places (trailing zeros not preserved)
 * @param {Number} val The value to round
 * @param {Number} places The number of decimal places to round to (must be integral)
 * @returns {Number} The rounded value
 */
export function round(val, places)
{
  return Number(`${ Math.round(`${ val }e${ places }`) }e-${ places }`)
}


/**
 * Produces a copy of `str` with all leading and trailing instances of `char` removed
 * @param {String} str The string to strip `char` from
 * @param {String} [char='<space>'] A one character string
 * @returns {String}
 *
 * The following inputs (with `char='_'`) all produce the same output (`a_test`):
 * - `a_test`
 * - `__a_test__`
 * - `_a_test`
 * - `a_test_`
 */
export function stringstrip(str, char=' ')
{
  const l = new RegExp(`^[${char}]+`)
  const r = new RegExp(`[${char}]+$`)
  return str.replace(l, '').replace(r, '')
}


/**
 * Converts an angle from radians to degrees
 * @param {Number} angle
 * @returns {Number}
 */
export function toDeg(angle)
{
  return angle * 180 / Math.PI
}


/**
 * Converts an angle from degrees to radians
 * @param {Number} angle
 * @returns {Number}
 */
export function toRad(angle)
{
  return angle * Math.PI / 180
}


/**
 * Extends the behaviour of `Object.getOwnPropertyDescriptors` by accepting a list of keys to filter from the results
 * @param {Object} args
 * @param {Object} args.object The object to get the property descriptors from
 * @param {String[]} args.filterkeys A list of keys to filter out of the results
 * @returns {Object} The property descriptors for `object`
 */
 export function getPropertyDescriptors({ object, filterkeys=[] })
 {
   const descriptors = Object.getOwnPropertyDescriptors(object)
   filterkeys.forEach(key => {
     delete descriptors?.[key]
   })
   return descriptors
 }


/**
 * Sets an immutable property on an object
 * @param   {Object}  args
 * @param   {Object}  args.object The object on which to set the property
 * @param   {String}  args.name The name of the property to set
 * @param   {*}       args.value The value of the property to set
 * @param   {Boolean} [args.enumerable=false] Whether the property should be enumerable
 * @returns {Object} Returns `object` on which the immutable property was set
 */
export function defineImmutableProperty({ object, name, value, enumerable = false })
{
  Object.defineProperty(object, name, {
    value,
    enumerable,
    writable: false,
    configurable: false
  })

  return object
}


/**
 * Sets a name property on an object (intended for use with classes)
 * @param {Object} args
 * @param {Object} args.object The object on which to set the name property
 * @param {String} args.name The value to assign to the object's name property
 * @returns {Object} Returns `object` after its name property has been set
 */
export const setNameProperty = ({ object, name }) => defineImmutableProperty({ object, name: 'name', value: name })


/**
 * An extended isArray function that can be used on typed arrays in addition to plain arrays
 * @param {*} obj
 * @returns {Boolean}
 */
export function isArray(obj)
{
  return /array/i.test(Object.prototype.toString.call(obj))
}
