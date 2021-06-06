import { vec3 } from 'gl-matrix'

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
   * @param {Object} args
   * @param {vec3} [args.ambient=[0,0,0]] The ambient light reflectivity
   * @param {vec3} [args.diffuse=[1,1,1]] The diffuse light reflectivity
   * @param {vec3} [args.specular=[0,0,0]] The specular light reflectivity
   * @param {number} [args.shininess=32] The shininess coefficient
   */
  constructor({ ambient, diffuse, specular, shininess })
  {
    this.ambient   = ambient   ?? vec3.create(0, 0, 0)
    this.diffuse   = diffuse   ?? vec3.create(1, 1, 1)
    this.specular  = specular  ?? vec3.create(0, 0, 0)
    this.shininess = shininess ?? 32
  }
}
