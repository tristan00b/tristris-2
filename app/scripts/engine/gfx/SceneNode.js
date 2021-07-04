import { mat4 } from 'gl-matrix'

import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * A `SceneGraph` tree-node for containing information pertaining to how meshes are drawn within a scene
 */
export class SceneNode
{
  constructor()
  {
    this._parent = null
    this._children = []
  }

  /**
   * @type {Entity}
   * @throws {SceneNodeComponentError} Setter throws when argument is not an instance of Entity
   */
  get parent()
  {
    return this._parent
  }

  set parent(parent)
  {
    checkSceneNodeArgument(parent)
      ? this._parent = parent
      : Log.warn('parent argument must be an instance of Entity')
  }

  /**
   * @param {Entity} parent The entity to set as parent to this component's entity
   * @throws {SceneNodeComponentError} Setter throws when argument is not an instance of Entity
   */
  setParent(parent)
  {
    checkSceneNodeArgument(parent)
      ? this._parent = parent
      : Log.warn('parent argument must be an instance of Entity')
    return this
  }

  /**
   * @type {Entity[]}
   * @readonly
   */
  get children()
  {
    return this._children
  }

  /**
   * @param {...Entity} children One or more entities to set as the children for this component's entity
   */
  addChild(...children)
  {
    children
      .forEach(child => {
        checkSceneNodeArgument(child)
          ? this._children.push(child)
          : Log.warn('parent argument must be an instance of Entity')
      })
    return this
  }
}

/**
 * Checks that a node is an instance of Entity
 * @returns {Entity} Returns the argument, unchanged, if the check passes
 * @throws {SceneNodeComponentError} Throws when node is not an instance of Entity
 * @private
 */
function checkSceneNodeArgument(node)
{
  return node instanceof Entity
}

/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
 const Log = MakeLogger(SceneNode)


 /**
  * @see {@link module:Engine/Utilities.MakeErrorType}
  * @private
  */
 const SceneNodeError = MakeErrorType(SceneNode)
