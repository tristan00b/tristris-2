/**
 * Creates a 2D array of zeros
 * @param {number} num value to set elements of the matrix to
 * @param {number} cols Number of columns
 * @param {number} [rows] Number of rows
 * @returns {number[][]} `arr[cols][cols]` when `rows` is not supplied
 */
export const Matrix = (num, width, height) =>
  Array(height || width).fill().map(_ => Array(width).fill(num))

/**
 * Creates a 2D array of zeros
 * @param {number} cols Number of columns
 * @param {number} [rows] Number of rows
 * @returns {number[][]} `arr[cols][cols]` when `rows` is not supplied
 */
export /* ignore coverage: */
  const ZerosMatrix = (width, height) => Matrix(0, width, height)

/**
 * Creates a 2D array of ones
 * @param {number} cols Number of columns
 * @param {number} [rows] Number of rows
 * @returns {number[][]} `arr[cols][cols]` when `rows` is not supplied
 *
 *
 */
export /* ignore coverage */
  const OnesMatrix = (width, height) => Matrix(1, width, height)
