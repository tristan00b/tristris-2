import { mat4 } from 'gl-matrix'

import { Entity } from './Entity'
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
   * @type {SceneNode}
   */
  get parent()
  {
    return this._parent
  }

  /**
   * @param {SceneNode} parent The node to amke this node a child of
   */
  setParent(parent)
  {
    if (parent instanceof SceneNode)
      this._parent = parent
    else
      Log.warn('parent argument must be an instance of SceneNode')

    return this
  }

  /**
   * @type {SceneNode[]}
   * @readonly
   */
  get children()
  {
    return this._children
  }

  /**
   * @param {SceneNode} child One or more nodes to make this node the parent of
   */
  addChild(child)
  {
    if (child instanceof SceneNode)
      this._children.push(child)
    else
      Log.warn('parent argument must be an instance of SceneNode')

    return this
  }
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
