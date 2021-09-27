import {
  vec3,
  vec4,
  mat4,
  quat
} from 'gl-matrix'

/**
 * Generates 4x4 a matrix (M=RTS) for represening an object's 3D orientation
 */
export class Transform
{
  constructor()
  {
    this._translation    = [0,0,0]
    this._rotation       = quat.create()
    this._scale          = [1,1,1]
    this._localTransform = mat4.create()
    this._worldTransform = mat4.create()
    this._isDirty        = false
  }

  /**
   * @type {external:vec3}
   * @default [0,0,0]
   */
  get translation()
  {
    return this._translation
  }

  set translation(translation)
  {
    this._isDirty = true
    this._translation = translation
  }

  /**
   * @param {external:vec3} translation
   * @returns {Transform} The `this` object referece
   */
  setTranslation(translation)
  {
    this.translation = translation
    return this
  }

  /**
   * @type {external:quat}
   */
  get rotation()
  {
    return this._rotation
  }

  set rotation(rotation)
  {
    this._isDirty = true
    this._rotation = rotation
  }

  /**
   * @param {external:quat} rotation
   * @returns {Transform} The `this` object referece
   */
  setRotation(rotation)
  {
    this.rotation = rotation
    return this
  }

  /**
   * @type {external:vec3}
   */
  get scale()
  {
    return this._scale
  }

  set scale(scale)
  {
    this._isDirty = true
    this._scale = scale
  }

  /**
   * @param {external:vec3} scale
   * @returns {Transform} The `this` object referece
   */
  setScale(scale)
  {
    this.scale = scale
    return this
  }

  /**
   * @type {external:mat4}
   * @readonly
   */
  get localTransform()
  {
    if (this._isDirty)
    {
      this._localTransform = mat4.fromRotationTranslationScale(
        mat4.create(),
        this._rotation,
        this._translation,
        this._scale
      )
      this._isDirty = false
    }

    return this._localTransform
  }

  /**
   * @type {external:mat4}
   */
  get worldTransform()
  {
    return this._worldTransform
  }

  set worldTransform(transform)
  {
    this._worldTransform = transform
  }
}
