/**
 * Used for grouping components by tag
 * @example
 * const components = [...]
 * const pinkElephants = components.filter(c => c.isTag && c.name == 'PinkElephant')
 */
export class Tag
{
  /**
   * @type {Boolean}
   * @readonly
   */
   static get isTag()
   {
     return true
   }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isTag()
  {
    return true
  }
}
