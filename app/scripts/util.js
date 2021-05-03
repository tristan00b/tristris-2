/** @module util */

/**
 * @ typedef {Object} Type Generic types for documentation purposes
 * @ typedef {Object} TypeError
 * @ typedef {Object} TypeLogger
 */

/**
 * Returns a subclass of Error (e.g. Type -> TypeError)
 * @param {Type} T The type to derive an error type from
 * @returns {TypeError} A new error type `${T.name}Error`
 */
export function MakeErrorType(T) {
  return class extends Error {
    name = `${T.name}Error`
  }
}

/**
 * Returns a typed logger derived from `Type T`. Prepends the type from which it was derived to log messages.
 * @param {Type} T The type to derive from
 * @returns {TypeLogger} A new logger type `${T.name}Logger`
 */
export function MakeLogger(T) {
  return class {
    name = `${T.name}Logger`

    static debug(msg, ...rest)
    {
      console.debug(`${T.name}: ${msg}`, ...rest)
    }
    static info(msg, ...rest)
    {
      console.info(`${T.name}: ${msg}`, ...rest)
    }
    static warn(msg, ...rest)
    {
      console.warn(`${T.name}: ${msg}`, ...rest)
    }
    static error(msg, ...rest)
    {
      console.error(`${T.name}: ${msg}`, ...rest)
    }
  }
}
