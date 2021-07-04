import {
  vec3,
  vec4,
  mat4,
  quat
} from 'gl-matrix'

/**
 */
export class Transform
{
  /**
   * @param {Object} [args]
   * @param {extern:vec3} [args.translation=[0,0,0]]
   * @param {extern:quat} [args.rotation=quat.identity]
   * @param {extern:vec3} [args.scale=[1,1,1]]
   */
  constructor({ enabled, translation, rotation, scale } = {})
  {
    this._translation    = translation ?? vec3.fromValues(0,0,0)
    this._rotation       = rotation    ?? quat.create()
    this._scale          = scale       ?? vec3.fromValues(1,1,1)
    this._localTransform = mat4.create()
    this._worldTransform = mat4.create()
    this._isDirty        = false
  }

  /**
   * @type {external:vec3}
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

  setTranslation(translation)
  {
    this._isDirty = true
    this._translation
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
   * @returns {Object} this
   */
  setRotation(rotation)
  {
    this._isDirty = true
    this._rotation = rotation
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
   * @returns {this}
   */
  setScale(scale)
  {
    this._isDirty = true
    this._scale = scale
    return this
  }

  /**
   * @type {external:mat4}
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
