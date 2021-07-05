import { MakeErrorType, MakeLogger } from '../utilities'

/**
 * Queries a scene for all entities having the specified component types associated
 */
export class Query
{
  /**
   * @param  {...ComponentType} types The component types to query for
   */
  constructor(...types)
  {
    this._types = types
    this._entities = []
    this._components = []
  }

  /**
   * Runs the query on a scene
   * @param {Scene} scene The scene to query
   */
  run(scene)
  {
    this.types.forEach(Type => {
      if (!scene.isComponentTypeRegistered(Type))
        throw new QueryError(`Attempted to query for unregistered component type ${Type.name}`)
    })

    scene.entities.forEach(entity => {
      const components = this.types.map(Type => scene.getComponent(entity, Type))

      const foundAllComponents = (components.length > 0) && (components
        .map((c, idx) => c instanceof this.types[idx])
        .reduce((acc, found) => acc && found))

      if (foundAllComponents)
      {
        this._entities.push(entity)
        this._components.push(components)
      }
    })

    return this
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
