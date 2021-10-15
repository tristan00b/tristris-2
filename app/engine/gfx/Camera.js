import { mat4, vec3 } from 'gl-matrix'


/**
 * Generates 4x4 lookat and perspective matrices
 */
export class Camera
{
  constructor()
  {
    this.setLookat()
    this.setPerspective()
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Lookat
  //

  /**
   * The location of the camera
   * @type {external:vec3}
   * @default [0,0,1]
   */
  get eye() { return this._eye }

  set eye(eye)
  {
    this.setLookat({ eye })
  }

  /**
   * The location that the camera is looking at
   * @type {external:vec3}
   * @default [0,0,0]
   */
  get at() { return this._at }

  set at(at)
  {
    this.setLookat({ at })
  }

  /**
   * The camera's up vector
   * @type {external:vec3}
   * @default [0,1,0]
   */
  get up() { return this._up }

  set up(up)
  {
    this.setLookat({ up })
  }

  /**
   * Gets lookat transform matrix
   * @type {external:mat4}
   * @readonly
   */
  get lookat()
  {
    if (this._lookatIsDirty)
    {
      this._lookat = computeLookatMatrix(this)
      this._lookatIsDirty = false
    }

    return this._lookat
  }

  /**
   * Sets the lookat tranform matrix
   * @type {Object<external:vec3,external:vec3,external:vec3>}
   * @param {Object} args
   * @param {external:vec3} [args.eye=[0,0,1]] The camera's position in world coordinates
   * @param {external:vec3} [args.at=[0,0,-1]] The position that the camera is looking at in world coordinates
   * @param {external:vec3} [args.up=[0,1,0]]  A vector specifying the direction that the top of the camera
   *                                           points (often aligns with the y-axis)
   * @returns {Camera} The `this` object reference
   */
  setLookat({ eye, at, up } = {})
  {
    // Set properties by priority: arg > currently set value > default value
    this._lookatIsDirty = true
    this._eye = eye ?? this._eye ?? [0,  0,  1]
    this._at  = at  ?? this._at  ?? [0,  0, -1]
    this._up  = up  ?? this._up  ?? [0,  1,  0]
    return this
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Perspective
  //

  /**
   * The camera's near plane distance (setting triggers a matrix calculation; use {@link Camera#setPerspective} to avoid
   * triggering extra calculations by setting properties individually)
   * @type {Number}
   * @default 0.1
   */
  get near() { return this._near }

  set near(near)
  {
    this.setPerspective({ near })
  }

  /**
   * The camera's far plane distance (setting triggers a matrix calculation; use {@link Camera#setPerspective} to avoid
   * triggering extra calculations by setting properties individually)
   * @type {Number}
   * @default 100
   */
  get far() { return this._far }

  set far(far)
  {
    this.setPerspective({ far })
  }

  /**
   * The camera's y-axis field of view (setting triggers a matrix calculation; use {@link Camera#setPerspective} to
   * avoid triggering extra calculations by setting properties individually)
   * @type {Number}
   * @default (60*Math.PI/180)
   */
  get fovy() { return this._fovy }

  set fovy(fovy)
  {
    this.setPerspective({ fovy })
  }

  /**
   * The camera's aspect ratio (setting triggers a matrix calculation; use {@link Camera#setPerspective} to avoid
   * triggering extra calculations by setting properties individually)
   * @type {Number}
   * @default 1.5
   */
  get aspect() { return this._aspect }

  set aspect(aspect)
  {
    this.setPerspective({ aspect })
  }

  /**
   * Gets the perspective matrix
   * @type {external:mat4}
   * @readonly
   */
  get perspective()
  {
    if (this._perspectiveIsDirty)
    {
      this._perspective = computePerspectiveMatrix(this)
      this._perspectiveIsDirty = false
    }

    return this._perspective
  }

  /**
   * Sets the perspective projection matrix (triggers a matrix calculation)
   * @param {Object} args
   * @param {Number} [args.near=0.1] the near plain distance
   * @param {Number} [args.far=100] The far plane distance
   * @param {Number} [args.fovy=(60 * Math.PI/180)] The y-axis field of view (radians)
   * @param {Number} [args.aspect=1.5] The aspect ratio (width/height)
   * @returns {Camera} The `this` object reference
   */
  setPerspective({ near, far, fovy, aspect } = {})
  {
    // Set properties by priority: arg > currently set value > default value
    this._perspectiveIsDirty = true
    this._near   = near   ?? this._near   ?? 0.1,
    this._far    = far    ?? this._far    ?? 100.0,
    this._fovy   = fovy   ?? this._fovy   ?? 60 * Math.PI/180,
    this._aspect = aspect ?? this._aspect ?? 1.5
    return this
  }
}


/** @private */
function computeLookatMatrix({ eye, at, up })
{
  return mat4.lookAt([], eye, at, up)
}


/** @private */
function computePerspectiveMatrix({ fovy, aspect, near, far})
{
  return mat4.perspective([], fovy, aspect, near, far)
}
