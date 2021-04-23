/* ignore coverage */
class Type {} // for documentation

/**
 * Returns a subclass of Error (e.g. Type -> TypeError)
 * @param {Type} type The type to derive an error type from
 * @returns {TypeError} A new error type `${Type.name}Error`
 */
export function MakeErrorType(type) {
  return class extends Error {
    name = `${type.name}Error`
  }
}
