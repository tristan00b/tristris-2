import { mat4, vec3 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * Represents the view point from which a scene is to be drawn
 */
export class Camera
{
  /**
   * @param {Object}        [args]
   * @param {external:mat4} [args.lookat] A 4x4 lookat transform matrix (defaults to the identity matrix)
   * @param {external:mat4} [args.perspective] A 4x4 perspective transform matrix (defaults to the identity matrix)
   */
  constructor({ lookat, perspective } = {})
  {
    lookat
      ? (this.lookat  = lookat            )
      : (this._lookat = mat4.create()     )

    perspective
      ? (this.perspective  = perspective  )
      : (this._perspective = mat4.create())
  }

  /**
   * Sets the lookat tranform matrix
   * @type {Object<external:vec3,external:vec3,external:vec3>}
   * @param {Object} args
   * @param {external:vec3} [args.eye=[0,0,0]] The camera's position in world coordinates
   * @param {external:vec3} [args.at=[0,0,0]]  The position that the camera is looking at in world coordinates
   * @param {external:vec3} [args.up=[0,0,0]]  A vector specifying the direction that the top of the camera
   *                                           points (often aligns with the y-axis)
   */
  setLookat({ eye, at, up })
  {
    this._eye = eye ?? this._eye ?? [0, 0, 0]
    this._at  = at  ?? this._at  ?? [0, 0, 0]
    this._up  = up  ?? this._up  ?? [0, 0, 0]

    this._lookat = mat4.lookAt(mat4.create(),
      this._eye,
      this._at,
      this._up)

    return this
  }

  /**
   * Gets lookat transform matrix
   * @type {external:mat4}
   * @readonly
   */
  get lookat()
  {
    return this._lookat
  }

  /**
   * Sets the perspective projection matrix
   * @param {Object} args
   * @param {Number} [args.near=0.1]
   * @param {Number} [args.far=100]
   * @param {Number} [args.fovy=Math.PI/4]
   * @param {Number} [args.aspect=300/150]
   */
  setPerspective({ near, far, fovy, aspect })
  {
    // Set properties by priority: arg < current value < default value
    this._near   = near   ?? this._near   ?? 0.1,
    this._far    = far    ?? this._far    ?? 100.0,
    this._fovy   = fovy   ?? this._fovy   ?? Math.PI / 4.0,
    this._aspect = aspect ?? this._aspect ?? 300/150

    this._perspective = mat4.perspective(mat4.create(),
      this._fovy,
      this._aspect,
      this._near,
      this._far)

    return this
  }

  /**
   * @param {Object} args
   * @param {number} args.width
   * @param {number} args.height
   */
  setAspect({ width, height }) // ignore coverage
  {
    this.perspective = { aspect: width/height }
  }

  /**
   * @type {external:mat4}
   * @readonly
   */
  get perspective()
  {
    return this._perspective
  }

  /**
   * @type {external:mat4}
   * @readonly
   */
  get projection()
  {
    return this._perspective
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
const Log = MakeLogger(Camera)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const CameraError = MakeErrorType(Camera)
