import { Component } from '../app/scripts/engine/ecs/components/Component'
import { TagComponent } from "../app/scripts/engine/ecs/components/TagComponent"

describe('TagComponent', function () {

  const MyTagComponent = class extends TagComponent {}
  const myTagComponent = new MyTagComponent

  describe('TagComponent.isTagComponent', function () {
    it('is a tag', function () {
      expect(TagComponent.isTagComponent).toBe(true)
    })
  })

  describe('MyTagComponent.constructor', function () {
    it('produces an instance of Component', function () {
      expect(myTagComponent instanceof Component).toBe(true)
    })

    it('produces an instacne of TagComponent', function () {
      expect(myTagComponent instanceof TagComponent).toBe(true)
    })
  })

  describe('MyTagComponent.name', function () {
    it('has correct name', function () {
      expect(MyTagComponent.name).toBe('MyTagComponent')
      expect(myTagComponent.name).toBe('MyTagComponent')
    })
  })

  describe('MyTagComponent.isTagComponent', function () {
    it('is a tag component', function () {
      expect(MyTagComponent.isTagComponent).toBe(true)
      expect(myTagComponent.isTagComponent).toBe(true)
    })
  })
})
