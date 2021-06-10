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
