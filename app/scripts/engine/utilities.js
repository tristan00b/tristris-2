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
