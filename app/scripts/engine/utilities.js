/**
 * Genral utility functions
 * @module Engine/Utilities
 */


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
     * @param {*} msg
     * @param {...any} rest
     */
    static debug(msg, ...rest)
    {
      console.debug(`${T.name}: ${msg}`, ...rest)
    }

    /**
     * Writes to `console.info`
     * @param {*} msg
     * @param {...any} rest
     */
    static info(msg, ...rest)
    {
      console.info(`${T.name}: ${msg}`, ...rest)
    }

    /**
     * Writes to console.warn
     * @param {*} msg
     * @param {...any} rest
     */
    static warn(msg, ...rest)
    {
      console.warn(`${T.name}: ${msg}`, ...rest)
    }

    /**
     * Writes to console.error
     * @param {*} msg
     * @param {...any} rest
     */
    static error(msg, ...rest)
    {
      console.error(`${T.name}: ${msg}`, ...rest)
    }
  }
}


/**
 * Given a name and array of property names, creates constant enumerator of type `enum.<Number>`
 * @param {String}   clsname The name for the new enum type
 * @param {String[]} properties An array of property names
 */
export function MakeConstEnumerator(clsname, properties)
{
  const enumerable  = true
  const writable    = false
  const name        = [ 'name', { value: clsname } ]
  const rest        = Object.entries(properties).map(([_, key], idx) => [key, { value: idx, enumerable, writable }])
  const descriptors = Object.fromEntries([name, ...rest])

  return Object.defineProperties({}, descriptors)
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
