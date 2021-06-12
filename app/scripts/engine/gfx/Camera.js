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
   */
  set lookat({ eye, at, up })
  {
    this._eye = eye ?? this._eye ?? [0, 0, 0]
    this._at  = at  ?? this._at  ?? [0, 0, 0]
    this._up  = up  ?? this._up  ?? [0, 0, 0]

    this._lookat = mat4.lookAt(mat4.create(),
      this._eye,
      this._at,
      this._up)
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

  set perspective({ near, far, fovy, aspect })
  {
    this._near   = near   ?? this._near   ?? 0.1,
    this._far    = far    ?? this._far    ?? 100.0,
    this._fovy   = fovy   ?? this._fovy   ?? 45.0 * Math.PI / 180.0,
    this._aspect = aspect ?? this._aspect ?? 300/150

    this._perspective = mat4.perspective(mat4.create(),
      this._fovy,
      this._aspect,
      this._near,
      this._far)
  }

  /**
   * @type {external:mat4}
   * @readonly
   */
  get projection()
  {
    return this._perspective
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
