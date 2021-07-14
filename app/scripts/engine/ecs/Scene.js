import { MakeErrorType,
         MakeLogger          } from '../utilities'

import { Camera              } from '../gfx/Camera'
import { Light               } from '../gfx/Light'
import { Material            } from '../gfx/Material'
import { Mesh                } from '../gfx/Mesh'
import { SceneNode           } from '../gfx/SceneNode'
import { ShaderProgram       } from '../gfx/ShaderProgram'
import { Transform           } from '../gfx/Transform'

import { Entity              } from './Entity'
import { Tag                 } from './Tag'


/** @module Engine/ecs/Scene */


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
    this._entities = []
    this._components = {}
    this._systems = []
  }

  /**
   * The array of entities that have been added to the scene
   *
   * **Important**: Entities are stored in a *sparse* array, and thus the entity array's `length` property cannot be
   * assumed to be valid. Use {@link Scene#entityCount} to get the number of stored entities.
   * @type {Entity[]}
   */
  get entities() { return this._entities }

  /**
   * The number of entities that have been added to the scene. Use this property instead of `scene.entities.length`,
   * which cannot be relied upon to report the correct value (see {@link Scene#entities} for explanation).
   * @type {Number}
   */
  get entityCount()
  {
    return this._entities.reduce((sum, e) => e ? sum+1 : sum, 0)
  }

  /**
   * Gets the entity associated with a given component, assuming the entity exists (via {@link Scene#addEntity}), the
   * component's type has been registered (via {@link Scene#registerComponentType}), and the component has been
   * associated with the entity (via {@link Scene#addEntity})
   * @param {ComponentType} component A object whose type has been registered as a component type
   * @returns {Entity|undefined} Returns the entity component's entity, if it exists, otherwise `undefined`
   */
  getEntity(component)
  {
    const key = keyFrom(component.constructor)
    const index = this._components[key]?.findIndex(element => element === component)
    return this._entities[index]
  }

  /**
   * Gets all components of a single type
   * @param {ComponentType} Type The type of components the get
   * @returns {ComponentType[]|undefined}
   */
  getComponentsOfType(Type)
  {
    return this._components[keyFrom(Type)]
  }

  /**
   * @type {System[]}
   */
  get systems() { return this._systems }

  /**
   * Adds one or more enetities to the scene
   * @param  {Entity} entity
   */
  addEntity(entity)
  {
    const hasEntity = this.hasEntity(entity)

    hasEntity
      ? Log.warn(`Entity (id: ${entity.id}) already added`)
      : this._entities[entity.id] = entity

    return !hasEntity
  }

  /**
   * Tells whether an entity as been added to the scene
   * @param {...Entity} entity
   * @returns {Boolean}
   */
  hasEntity(entity)
  {
    return !!this._entities[entity?.id]
  }

  /**
   * @param {ComponentType} type The type to check
   */
  isComponentTypeRegistered(type)
  {
    return !!this._components[keyFrom(type)]
  }

  /**
   * @param {ComponentType} type
   */
  registerComponentType(type)
  {
    const isRegistered = this.isComponentTypeRegistered(type)

    isRegistered
      ? Log.warn(`ComponentType ${type.name} already registered`)
      : this._components[keyFrom(type)] = []

    return !isRegistered
  }

  /**
   * @param {Entity} entity The entity whose component to retrieve
   * @param {ComponentType} Type The type of component to retrieve
   * @returns {ComponentType|null} The component associated with `entity`, or `null` if it does not exist
   */
  getComponent(entity, Type)
  {
    return this._components[keyFrom(Type)]?.[entity?.id]
  }

  /**
   * Sets the entity's component of type `component.constructor` to component, overwriting any previously set component
   * of the same type
   * @param {Entity} entity The entity whose component to set
   * @param {ComponentType} component The component to associate with `entity`
   * @example
   * const c0 = new Component(...)
   * const c1 = new Component(...)
   * scene.setComponent(entity, c0) // => entity now has c0 associated with it
   * scene.setComponent(entity, c1) // => c0 has been overwritten with c1
   */
  setComponent(entity, component)
  {
    if (!this.hasEntity(entity))
      Log.warn(`Entity must be added prior to setting its components`)
    else if(!this.isComponentTypeRegistered(component))
      Log.warn(`Component types must be registered before use (received: ${keyFrom(component)})`)
    else
      this._components[keyFrom(component)][entity.id] = component
  }

  /**
   * This is a convenience function, which calls `getComponent` internally, converting its result into a boolean
   * @param {Entity} entity The entity
   * @param {ComponentType} type The type of component to query for
   * @returns {Boolean} True if the entity has component of type `ComponentType` associated with it, and false otherwise
   */
  hasComponent(entity, type)
  {
    return !!this.getComponent(entity, type)
  }

  /**
   * Adds the specified systems to the scene, checking that each one is an instance of `System`, and discarding those
   * that are not
   * @param {System} system The system to add to the scene
   */
  addSystem(system)
  {
    if (system instanceof System) this._systems.push(system)
    else Log.warn(`Received invalid system argument ${system.name}`)
  }

  /**
   * Calls `update` on all systems that have been added to this scene with the time elapsed since the previous update
   * (Note that the time duration `dt` is expected to be provide by the JavaScript runtime, e.g. by
   * `window.requestAnimationFrame`)
   * @param {Number} dt The time duration (ms) since the last update
   */
  update(dt)
  {
    this._systems.forEach(system => system.update(dt))
  }

  /** @todo implement */
  static inflate(data)
  {
    throw new SceneError('not implemented')
  }
}

/**
 * Takes an object and derives a key from it
 * @param {Object} obj The object to derive a key from
 * @returns {String} The key derived from object
 */
export function keyFrom(obj)
{
  return ShaderProgram.isPrototypeOf(obj) ? ShaderProgram.name :
         obj instanceof ShaderProgram     ? ShaderProgram.name :
                                            (obj?.name || obj?.constructor?.name || String(obj))
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
