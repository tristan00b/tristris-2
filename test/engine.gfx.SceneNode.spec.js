import { SceneNode } from '../app/scripts/engine/gfx/SceneNode'

describe('SceneNode', function () {

  describe('SceneNode#addChild', function () {

    it('sets parent and child links appropriately', function () {

      const s0 = new SceneNode
      const s1 = new SceneNode

      s0.addChild(s1)

      expect(s1.parent).toBe(s0)
      expect(s0.children.indexOf(s1) >= 0).toBe(true)
    })
  })

  describe('ScenNode@@iterator', function () {

    it('can iterate', function () {
      const s0 = new SceneNode
      expect(_ => [...s0]).not.toThrow()
    })

    it('yields the correct number of children', function () {

      const s0 = new SceneNode
      const s1 = new SceneNode
      const s2 = new SceneNode
      const s3 = new SceneNode
      const s4 = new SceneNode
      const s5 = new SceneNode

      s0.addChildren(s1, s2)
      s1.addChildren(s3, s4)
      s2.addChildren(s5)

      expect([...s0].length).toEqual(6)
    })

    it('yields all parents before their children', function () {

      const s0 = new SceneNode
      const s1 = new SceneNode
      const s2 = new SceneNode
      const s3 = new SceneNode
      const s4 = new SceneNode
      const s5 = new SceneNode

      s0.addChildren(s1, s2)
      s1.addChildren(s3, s4)
      s2.addChildren(s5)

      const mapper  = (node, nodeIdx, nodes) => {
        const parentIdx = nodes.indexOf(node.parent)
        return parentIdx >= 0 && parentIdx < nodeIdx || nodeIdx == 0 /* root has no parent */
      }
      const reducer = (acc, n) => acc && n

      const allParentsPrecedeChildren = [...s0].map(mapper).reduce(reducer)

      expect(allParentsPrecedeChildren).toBe(true)
    })
  })
})
