import { mat4 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from './Util'


/**
 *
 */
export class Camera
{
  /**
   * @constructor
   * @param {WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {*} param1
   */
  constructor(gl, { near, far, fovy, aspect } = {}) {
    near   ??= 0.1
    far    ??= 100.0
    fovy   ??= 60 * Math.PI / 180
    aspect ??= gl.canvas.clientWidth / gl.canvas.clientHeight
    this._projectionMatrix = mat4.create()

    mat4.perspective(this._projectionMatrix,
      fovy,
      aspect,
      near,
      far)
  }

  /**
   * Returns a projection matrix
   * @type {mat4}
   */
  get projectionMatrix()
  {
    return this._projectionMatrix
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(Camera)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const CameraError = MakeErrorType(Camera)
