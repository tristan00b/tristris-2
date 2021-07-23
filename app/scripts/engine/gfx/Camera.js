import { mat4, vec3 } from 'gl-matrix'


/**
 * Describes the view point from which to draw a scene
 */
export class Camera
{
  constructor()
  {
    this.setLookat({
      eye: [0, 0, 0],
      at:  [0, 0, 0],
      up:  [0, 0, 0],
     })

     this.setPerspective({
      near:   0.1,
      far:    100.0,
      fovy:   Math.PI / 2,
      aspect: 1.5,
     })
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Lookat
  //

  /**
   * The location of the camera (setting triggers a matrix calculation; use {@link Camera#setLookat} to avoid triggering
   * extra calculations by setting properties individually)
   * @type {external:vec3}
   * @default [0,0,0]
   */
  get eye() { return this._eye }

  set eye(eye)
  {
    if (this._eye !== eye)
      this.setLookat({ eye })
  }

  /**
   * The location that the camera is looking at (setting triggers a matrix calculation; use {@link Camera#setLookat} to
   * avoid triggering extra calculations by setting properties individually)
   * @type {external:vec3}
   * @default [0,0,0]
   */
  get at() { return this._at }

  set at(at)
  {
    if (this._at !== at)
      this.setLookat({ at })
  }

  /**
   * The camera's up vector (setting triggers a matrix calculation; use {@link Camera#setLookat} to avoid triggering
   * extra calculations by setting properties individually)
   * @type {external:vec3}
   * @default [0,0,0]
   */
  get up() { return this._up }

  set up(up)
  {
    if (this._up !== up)
      this.setLookat({ up })
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
   * Sets the lookat tranform matrix (triggers a matrix calculation)
   * @type {Object<external:vec3,external:vec3,external:vec3>}
   * @param {Object} args
   * @param {external:vec3} [args.eye=[0,0,0]] The camera's position in world coordinates
   * @param {external:vec3} [args.at=[0,0,0]]  The position that the camera is looking at in world coordinates
   * @param {external:vec3} [args.up=[0,0,0]]  A vector specifying the direction that the top of the camera
   *                                           points (often aligns with the y-axis)
   * @returns {Camera} The `this` object reference
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
    if (this._near !== near)
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
    if (this._far !== far)
      this.setPerspective({ far })
  }

  /**
   * The camera's y-axis field of view (setting triggers a matrix calculation; use {@link Camera#setPerspective} to
   * avoid triggering extra calculations by setting properties individually)
   * @type {Number}
   * @default Math.PI/4
   */
  get fovy() { return this._fovy }

  set fovy(fovy)
  {
    if (this._fovy !== fovy)
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
    if (this._aspect !== aspect)
      this.setPerspective({ aspect })
  }

  /**
   * Gets the perspective matrix
   * @type {external:mat4}
   * @readonly
   */
  get perspective()
  {
    return this._perspective
  }

  /**
   * Aliases `perspective` property
   * @type {external:mat4}
   * @see {@link Camera#perspective}
   * @readonly
   */
  get projection()
  {
    return this.perspective
  }

  /**
   * Sets the perspective projection matrix (triggers a matrix calculation)
   * @param {Object} args
   * @param {Number} [args.near=0.1] the near plain distance
   * @param {Number} [args.far=100] The far plane distance
   * @param {Number} [args.fovy=Math.PI/4] The field of view (45 degrees)
   * @param {Number} [args.aspect=1.5] The aspect ratio (width/height)
   * @returns {Camera} The `this` object reference
   */
  setPerspective({ near, far, fovy, aspect })
  {
    // Set properties by priority: arg > current value > default value
    this._near   = near   ?? this._near   ?? 0.1,
    this._far    = far    ?? this._far    ?? 100.0,
    this._fovy   = fovy   ?? this._fovy   ?? Math.PI / 4.0,
    this._aspect = aspect ?? this._aspect ?? 1.5

    this._perspective = mat4.perspective(mat4.create(),
      this._fovy,
      this._aspect,
      this._near,
      this._far)

    return this
  }

  /**
   * Aliases `setPerspective` property
   * @param {Object} args
   * @see {@link Camera#setPerspective})
   */
  setProjection(args)
  {
    return this.setPerspective(args)
  }
}
