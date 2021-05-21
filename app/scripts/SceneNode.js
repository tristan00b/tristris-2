import { mat4 } from 'gl-matrix'
import { MakeLogger } from './Util'

export class SceneNode
{
  constructor({ mesh, parent, children, local_transform, world_transform, shader } = {})
  {
    this._mesh = mesh ?? null
    this._parent = parent ?? null
    this._children = children ?? []
    this._local_transform = local_transform ?? mat4.create()
    this._world_transform = world_transform ?? mat4.create()
    this._shader = shader ?? null
  }

  get mesh() { return this._mesh }
  set mesh(mesh) { this._mesh = mesh }

  setMesh(mesh)
  {
    this._mesh = mesh
    return this
  }


  get parent() { return this._parent }
  set parent(parent) { this._parent = parent }

  setParent(parent)
  {
    this._parent = parent
    return this
  }


  get children() { return this._children }
  set children(children) { this._children = children }

  addChild(child)
  {
    child._parent = this
    this._children.push(child)
    return this
  }

  addChildren(...children)
  {
    children.forEach(child => this.addChild(child))
    return this
  }


  get localTransform() { return this._local_transform }
  set localTranform(transform) { this._local_transform = transform }

  setLocalTransform(transform)
  {
    this._local_transform = transform
    return this
  }


  get worldTransform() { return this._world_transform }
  set worldTransform(transform) { this._world_transform = transform }

  setWorldTransform(transform)
  {
    this._world_transform = transform
    return this
  }


  get shader() { return this._shader }
  set shader(shader) { this._shader = shader }

  setShader(shader)
  {
    this._shader = shader
    return this
  }

  get draw()
  {
    return this.mesh?.draw.bind(this.mesh)
  }

  [Symbol.iterator] = function* ()
  {
    let node  = null,
        nodes = [this]

    while (node = nodes.shift()) {
      nodes = [...nodes, ...node._children]
      yield node
    }
  }
}

const Log = MakeLogger(SceneNode)
