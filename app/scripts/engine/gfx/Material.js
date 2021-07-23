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
  /**
   * @todo add constraint checking
   * @param {Object} [args]
   * @param {vec4} [args.ambient=[0,0,0,1]] The ambient light reflectivity
   * @param {vec4} [args.diffuse=[1,1,1,1]] The diffuse light reflectivity
   * @param {vec4} [args.specular=[0,0,0,1]] The specular light reflectivity
   * @param {number} [args.shininess=32] The shininess coefficient
   */
  constructor({ ambient, diffuse, specular, shininess } = {})
  {
    this.ambient   = ambient   ?? vec4.create(0, 0, 0, 1)
    this.diffuse   = diffuse   ?? vec4.create(1, 1, 1, 1)
    this.specular  = specular  ?? vec4.create(0, 0, 0, 1)
    this.shininess = shininess ?? 32
  }
}
