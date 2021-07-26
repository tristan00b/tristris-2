import { vec4 } from 'gl-matrix'

/**
 * Basic Material class for storing mesh colour properties
 *
 * Constraints:
 * - Colour components `R`, `G`, `B` should be in range `[0, 1]`
 * - Shininess coefficient should be greater than or equal to `0`
 */
export class Material
{
  constructor()
  {
    this._ambient   = [0,   0,   0,   1]
    this._diffuse   = [0.9, 0.9, 0.9, 1]
    this._specular  = [0,   0,   0,   1]
    this._shininess = 64
  }

  /**
   * @type {external:vec4}
   * @default [0,0,0,1]
   */
  get ambient()
  {
    return this._ambient
  }

  set ambient(ambient)
  {
    this._ambient = ambient
  }

  /**
   * Sets the material's ambient reflectivity
   * @param {external:vec4} ambient
   * @returns {Material} The `this` object reference
   */
  setAmbient(ambient)
  {
    this.ambient = ambient
    return this
  }

  /**
   * @type {external:vec4}
   * @default [0.9,0.9,0.9,1]
   */
  get diffuse()
  {
    return this._diffuse
  }

  set diffuse(diffuse)
  {
    this._diffuse = diffuse
  }

  /**
   * Sets the material's diffuse reflectivity
   * @param {external:vec4} diffuse
   * @returns {Material} The `this` object reference
   */
  setDiffuse(diffuse)
  {
    this.diffuse = diffuse
    return this
  }

  /**
   * @type {external:vec4}
   * @default [0,0,0,1]
   */
  get specular()
  {
    return this._specular
  }

  set specular(specular)
  {
    this._specular = specular
  }

  /**
   * Sets the material's specular reflectivity
   * @param {external:vec4} specular
   * @returns {Material} The `this` object reference
   */
  setSpecular(specular)
  {
    this.specular = specular
    return this
  }

  /**
   * @type {Number}
   * @default 64
   */
  get shininess()
  {
    return this._shininess
  }

  set shininess(shininess)
  {
    this._shininess = shininess
  }

  /**
   * Sets the materials shininess
   * @param {Number} shininess
   * @returns {Material} The `this` object reference
   */
  setShininess(shininess)
  {
    this.shininess = shininess
    return this
  }
}
