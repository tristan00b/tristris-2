import { mat4 } from 'gl-matrix'

import { MakeErrorType, MakeLogger } from '../utilities'


/**
 * A `SceneGraph` tree-node for containing information pertaining to how meshes are drawn within a scene
 */
export class SceneNode
{
  /**
   * @param {Object}        [args={}]
   * @param {SceneNode}     [args.parent=null] The parent node for this node
   * @param {SceneNode[]}   [args.children=[]] An array of child nodes for this node
   * @param {Mesh}          [args.mesh=null] The mesh to associate with this node
   * @param {external:mat4} [args.localTransform=mat4.create()] The transform that orients the node within its local coordinate system (defaults to the identity matrix)
   * @param {external:mat4} [args.worldTransform=mat4.create()] The transform that orients the node within the world coordinate system (defaults to the identity matrix)
   * @param {ShaderProgram} [args.shader=null] The shader that will be used to draw this node and it's decendents
   *
   * @todo check for cycles
   */
  constructor({ parent, children, mesh, localTransform, worldTransform, shader } = {})
  {
    this._parent = parent ?? null
    this._children = children ?? []
    this._mesh = mesh ?? null
    this._localTransform = localTransform ?? mat4.create()
    this._worldTransform = worldTransform ?? mat4.create()
    this._shader = shader ?? null
  }

  /**
   * @type {Mesh}
   */
  get mesh() { return this._mesh }
  set mesh(mesh) { this._mesh = mesh }

  /**
   * Sets the node's mesh property and returns `this` to allow for chaining operations
   * @param {Mesh} mesh
   * @returns `this`
   */
  setMesh(mesh)
  {
    this._mesh = mesh
    return this
  }

  /**
   * @type {SceneNode}
   */
  get parent() { return this._parent }
  set parent(parent) { this._parent = parent }

  /**
   * Sets the node's parent property and returns `this` to allow for chaining operations
   * @param {SceneNode} parent
   * @returns `this`
   */
  setParent(parent)
  {
    this._parent = parent
    return this
  }

  /**
   * @type {SceneNode[]}
   */
  get children() { return this._children }
  set children(children) { this._children = children }

  /**
   * Adds a child to the list of child nodes and returns `this` to allow for chaining operations
   * @param {SceneNode} child
   * @returns `this`
   */
  addChild(child)
  {
    child._parent = this
    this._children.push(child)
    return this
  }

  /**
   * Adds children `c0`, `c1`, ..., `cn` to the list of child nodes and returns `this` to allow for chaining operations
   * @param  {...SceneNodes} children
   * @returns `this`
   */
  addChildren(...children)
  {
    children.forEach(child => this.addChild(child))
    return this
  }

  /**
   * @type {external:mat4}
   */
  get localTransform() { return this._localTransform }
  set localTranform(transform) { this._localTransform = transform }

  /**
   * Sets the node's local transform and returns `this` to allow for chaining operations
   * @param {external:mat4} transform
   * @returns `this`
   */
  setLocalTransform(transform)
  {
    this._localTransform = transform
    return this
  }

  /**
   * @type {external:mat4}
   */
  get worldTransform() { return this._worldTransform }
  set worldTransform(transform) { this._worldTransform = transform }

  /**
   * Sets the node's world transform and returns `this` to allow for chaining operations
   * @param {*} transform
   * @returns `this`
   */
  setWorldTransform(transform)
  {
    this._worldTransform = transform
    return this
  }

  /**
   * Setting the shader program provided will determine the rendering of this node and all its descendents until a
   * `SceneNode` with a different shader is encountered down the chain
   * @type {ShaderProgram}
   */
  get shader() { return this._shader }
  set shader(shader) { this._shader = shader }

  /**
   * Sets the node's shader and returns `this` to allow for chaining operations
   * @param {ShaderProgram} shader
   * @returns `this`
   */
  setShader(shader)
  {
    this._shader = shader
    return this
  }

  /**
   * Returns a function that invokes the mesh's draw method if the node's mesh property has been set
   * @type {Mesh.draw}
   */
  get draw()
  {
    return this.mesh?.draw.bind(this.mesh)
  }

  /**
   * Returns an iterator for stepping through all nodes from `this` through all of its successors in breadth-first order
   *
   * @alias "*[Symbol.iterator]"
   * @memberof SceneNode
   * @yields {SceneNode} The next node in breadth-first order
   */
  *[Symbol.iterator]()
  {
    let node  = null,
        nodes = [this]

    while (node = nodes.shift()) {
      nodes = [...nodes, ...node._children]
      yield node
    }
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
