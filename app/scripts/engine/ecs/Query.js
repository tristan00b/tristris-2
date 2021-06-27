import { MakeErrorType, MakeLogger } from '../utilities'

/**
 * Queries a Scene instance for all entities associated with each of a number of specified component types
 */
export class Query
{
  /**
   * @param {Scene} scene The `Scene` instance to query
   * @param  {...ComponentType} types The component types to query for
   */
  constructor(scene, ...types)
  {
    const components = scene.getComponentsOfType(...types)

    if (components.length !== types.length)
      throw new QueryError('Attempted to get components for unregistered component type')

    this._types = types
    this._entities = []
    this._components = []

    scene.entities.forEach(entity => {
      const components = scene.getEntityComponent(entity, ...types)

      if (components.length === types.length)
      {
        this._entities.push(entity)
        this._components.push(components)
      }
    })
  }

  /**
   * The component Types that were queried for
   * @type {ComponentType[]}
   */
  get types()
  {
    return this._types
  }

  /**
   * The entities that satisfied the query
   * @type {Entity[]}
   */
  get entities()
  {
    return this._entities
  }

  /**
   * The respective instances of `ComponentType` associated with each entity
   * @type {Component[]}
   */
  get components()
  {
    return this._components
  }
}



/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Query)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const QueryError = MakeErrorType(Query)
