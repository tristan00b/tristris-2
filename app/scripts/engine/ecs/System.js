/**
 * @typedef ComponentUpdateCallback
 * @param {Number} dt The amount of time that has elapsed since the previous call to this function
 * @param {...ComponentType} components The components associated with a given entity that are required for updating the
 *                                      the entity's state during a given update cycle
 */

/**
 * Applies a callback to the entity components matched by a `Query` instance
 *
 * @example
 * const query = new Query(scene, ComponentTypeA, ComponentTypeB)
 * const callback = (dt, componentA, componentB) => {
 *   // do work with the states of componentA and componentB here...
 * }
 * const system = new System(query, callback)
 * ...
 * system.update(dt) // executes over all entities having instances of both ComponentTypeA and ComponentTypeB
 */
export class System
{
  /**
   * @param {Query} query Provides the specific entity components to apply the callback to
   * @param {ComponentUpdateCallback} callback
   */
  constructor(query, callback)
  {
    this._query = query
    this._callback = callback
  }

  update(dt)
  {
    const { entities, components } = this._query

    components.forEach((components, index) => {
      if (entities[index].isEnabled)
        this._callback(dt, ...components)
    })
  }
}
