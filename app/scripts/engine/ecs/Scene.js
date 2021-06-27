import { Entity } from './Entity'
import { MakeErrorType, MakeLogger } from '../utilities'
import { Component } from './Component'


/**
 * A data structure for holding all ECS elements associated with a particular game scene
 */
export class Scene
{
  /**
   * Instantiates an instance of `Scene`
   */
  constructor()
  {
    this._isEnabled = true
    this._entities = []
    this._components = {}
    this._systems = []
  }

  /**
   * Adds one or more enetities to the scene
   * @param  {...Entity} entities
   */
  addEntity(...entities)
  {
    entities.forEach(entity =>
    {
      if (this.hasEntity(entity))
        Log.warn(`Entity (id: ${entity.id}) already added`)
      else
        this._entities[entity.id] = entity
    })
  }

  /**
   * Tells whether an entity as been added to the scene
   * @param {Entity} entity
   * @returns {Boolean}
   */
  hasEntity(entity)
  {
    return !!this._entities[entity?.id]
  }

  /**
   * @type {Entity[]}
   */
  get entities()
  {
    return this._entities
  }

  /**
   * Registers subclasses of `Component` enabling instances of their respective types to be added to entities
   * @param  {...ComponentType} types Any type that is a subclass of `Component`
   * @returns {Number} The number of `Component` types that were successfully added
   */
  registerComponentType(...types)
  {
    return types.map(type =>
      type?.name in this._components ? do { Log.warn(`ComponentType (${type.name}) already registered`); 0 } :
      type?.isComponent !== true     ? do { Log.warn(`Invalid ComponentType (${type.name})`);            0 } :
                                       do { this._components[type.name] = [];                            1 }
    ).reduce((sum, val) => sum+val, 0)
  }

  /**
   * Tells whether a `Component` type has been
   * @param {ComponentType|TagComponentType} type Any type that is a subclass of `Component`
   * @returns {Boolean}
   * @private
   */
  _isComponentTypeRegistered(type)
  {
    return type.name in this._components
  }

  /**
   * Tells whether a list of component types have been registered
   * @param  {...ComponentType} types The list of types to check
   * @returns {Boolean|Boolean[]} A single boolean value when only a single type is specified, or a list of booleans
   *                              when multiple types are specified
   */
  isComponentTypeRegistered(...types)
  {
    return types.length == 1 ? this._isComponentTypeRegistered(types[0])
                             : types.map(this._isComponentTypeRegistered.bind(this))
  }

  /**
   * @param  {...ComponentType} types
   * @returns
   */
  getComponentsOfType(...types)
  {
    return types.filter(type => this._isComponentTypeRegistered(type))
                .map(type => this._components[type.name])
  }

  /**
   * Sets the components on an entity that has been added to the scene, and returns a count of the number of components
   * that were successfully set
   *
   * Any errors that occur in the process are printed to the console
   * @param {Entity} entity
   * @param  {...ComponentType} components Instances of `ComponentType` to associate with `entity`
   * @returns {Number} The number of components that were successfully set
   */
  setEntityComponent(entity, ...components)
  {
    return components.map(c =>
      !this.hasEntity(entity)             ? do { Log.warn(`Entity must be added prior to setting its components`); 0 } :
      this._hasEntityComponent(c)         ? do { Log.warn(`Component already set`);                                0 } :
      !c?.isComponent                     ? do { Log.warn(`Invalid Component type ${c?.name}`);                    0 } :
      !this._isComponentTypeRegistered(c) ? do { Log.warn(`Component type (${c?.name}) not registered`);           0 } :
                                            do { this._components[c.name][entity.id] = c;                          1 }
    ).reduce((sum, val) => sum+val, 0)
  }

  /**
   * Gets a component if it has previously been set on `entity`
   * @param {Entity} entity
   * @param {ComponentType} type
   * @returns {ComponentType|undefined}
   * @private
   */
  _getEntityComponent(entity, type)
  {
    return this._components[type?.name]?.[entity?.id]
  }

  /**
   * Gets the specified list of components assocated with `entity` if they exist
   * @param {Entity} entity The entity whose components to get
   * @param  {...ComponentType} type The types of the components to get
   * @returns {Array.<ComponentType|undefined>} An array of components corresponding with `...components`
   * @example
   * scene.setEntityComponent(entity, c0, c1, c2)
   * scene.getEntityComponent(entity, c1, c2, c3, c4) // => [c1, c2, undefined, undefined]
   */
  getEntityComponent(entity, ...types)
  {
    return types.map(type => this._getEntityComponent(entity, type))
  }

  /**
   * Tells whether `entity` has component of type `ComponentType` associated with it
   * @param {Entity} entity The entity to check
   * @param {Component} type The type of component to check
   * @returns {Boolean}
   * @private
   */
  _hasEntityComponent(entity, type)
  {
    return !!this._getEntityComponent(entity, type)
  }

  /**
   * Tells whether `entity` as components of the specified types associated with it
   * @param {Entity} entity The entity to check
   * @param  {...Component} types The types of components to check
   * @returns {Boolean[]}
   */
  hasEntityComponent(entity, ...types)
  {
    const components = this.getEntityComponent(entity, ...types)
    return components.length == 0 ? false :
           components.length == 1 ? !!components[0] :
           components.map(c => !!c)
  }

  /** @todo implement */
  update(dt)
  {
    throw new SceneError('not implemented')
  }


  /** @todo implement */
  static inflate(data)
  {
    throw new SceneError('not implemented')
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(Scene)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const SceneError = MakeErrorType(Scene)
