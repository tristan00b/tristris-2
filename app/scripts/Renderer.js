/**
 * Class Rendere
 */
export class Renderer
{
  /**
   * @constructor
   * @param {object} canvas
   * @param {object} context
   * @param {object} config
   */
  constructor({ canvas, context, config })
  {
    Object.assign(this, { canvas, context, config })
  }

  /**
   * Draws the game state model
   * @param {Object} model
   */
  draw(model)
  {
  }
}
