import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Component } from '../app/scripts/engine/ecs/components/Component'
import { Scene } from '../app/scripts/engine/ecs/Scene'

describe('Scene', function () {

  class C0 extends Component {}
  class C1 extends Component {}
  class C2 extends Component {}
  class C3 extends Component {}

  describe('Scene.registerComponentType', function () {

    it('registers a single component type', function () {
      const scene = new Scene
      scene.registerComponentType(C0)

      expect(C0.name in scene._components).toBe(true)
    })

    it('registers multiple component types', function () {
      const scene = new Scene
      const types = [C0, C1, C2, C3]

      scene.registerComponentType(...types)

      const allRegistered = types.map(T => T.name in scene._components).reduce((acc, val) => acc && val)
      expect(allRegistered).toBe(true)
    })

    it('returns the correct registration count', function () {
      {
        // Zero arguments
        const scene = new Scene
        const count = scene.registerComponentType()
        expect(count).toBe(0)
      }

      {
        // Empty array
        const scene = new Scene
        const empty = []
        const count = scene.registerComponentType(...empty)
        expect(count).toBe(0)
      }

      {
        // Not a component
        const scene = new Scene
        const NotComponentType = class {}
        const count = scene.registerComponentType(NotComponentType)
        expect(count).toBe(0)
      }

      {
        // Single component
        const scene = new Scene
        const count = scene.registerComponentType(C0)
        expect(count).toBe(1)
      }

      {
        // Multiple components
        const scene = new Scene
        const count = scene.registerComponentType(C0, C1)
        expect(count).toBe(2)
      }

      {
        // Component re-registration
        const scene = new Scene
        const count = scene.registerComponentType(C0, C0, C1, C1, C2)
        expect(count).toBe(3)
      }

      {
        // Mix of components and non-components
        const scene = new Scene
        const count = scene.registerComponentType(C0, {}, C1, {}, {}, C2, C3)
        expect(count).toBe(4)
      }
    })

    it ('does not re-register component types', function () {
      const scene = new Scene
      const count = scene.registerComponentType(C0, C0, C1, C1)
      expect(count).toBe(2)
    })
  })

  describe('Scene.isComponentTypeRegistered', function () {
    const scene = new Scene
    scene.registerComponentType(C0, C1, C2)

    it('tells whether a single component type has been registered', function () {
      const results = [
        scene.isComponentTypeRegistered(C0),
        scene.isComponentTypeRegistered(C3)
      ]

      expect(results[0] && !results[1]).toBe(true)
    })

    it('tells whether multiple component types have been registered', function () {
      const results = scene.isComponentTypeRegistered(C0, C1, C2, C3)
      expect(results[0] && results[1] && results[2] && !results[3]).toBe(true)
    })
  })

  describe('Scene.getEntityComponent', function () {

    it('gets entity all components that have been set', function () {
      const scene = new Scene
      const entity = Entity.create()
      const types = [C0, C1, C2]

      scene.registerComponentType(...types)
      types.forEach((C, idx) => scene._components[C.name][entity.id] = new C)

      const components = scene.getEntityComponent(entity, C0, C1, C2)

      const gotAllComponents =
        components.length == 3 &&
        components.reduce((acc, _, index) => acc && components[index] instanceof types[index])

      expect(gotAllComponents).toBe(true)
    })
  })

  describe('Scene.hasEntityComponent', function () {

    it ('tells whether and entity\'s component(s) have been set', function () {
      const scene = new Scene
      const entity = Entity.create()
      const types = [C0, C1, C2]

      scene.registerComponentType(C0, C1, C2)
      types.forEach((C, idx) => scene._components[C.name][entity.id] = new C)

      {
        // Zero arguments
        expect(scene.hasEntityComponent(entity)).toBe(false)
      }

      {
        // Empty array
        const empty  = []
        expect(scene.hasEntityComponent(entity)).toBe(false)
      }

      {
        // Single component
        expect(scene.hasEntityComponent(entity, C0)).toBe(true)
      }

      { // Multiple components
        const result = scene.hasEntityComponent(entity, ...types)
        const allComponentsFound = result.length && result.reduce((acc, val) => acc && val)
        expect(allComponentsFound).toBe(true)
      }

      {
        // Not a component
        const NotComponentType = class {}
        const result = scene.hasEntityComponent(entity, NotComponentType)
        expect(result).toBe(false)
      }

      {
        // Unregistered component
        const result = scene.hasEntityComponent(entity, C3)
        expect(result).toBe(false)
      }

      {
        // Mixed registered, unregistered, and non-components
        const result = scene.hasEntityComponent(entity, C0, {}, C1, {}, C1, C2, {}, C3)
        const allTrueOrFalse = result.length && result.reduce((acc, val) => acc && typeof val == 'boolean')
        expect(allTrueOrFalse).toBe(true)
      }
    })
  })

  describe('Scene.setEntityComponent', function () {

    const scene  = new Scene
    const entity = Entity.create()
    const types  = [C0, C1, C2]

    scene.addEntity(entity)
    scene.registerComponentType(...types)
    scene.setEntityComponent(entity, new C0, new C1, new C2)

    it('sets all components whose types have been registered', function () {
      const components = scene.getEntityComponent(entity, ...types)
      const allComponentsFound = components.length == types.length
         && types.reduce((acc, type, index) => acc && (components[index] instanceof type), true)

      expect(allComponentsFound).toBe(true)
    })

    it('does not set components of unregistered types', function () {
      const c3 = new C3
      scene.setEntityComponent(entity, c3)
      expect(scene._components[C3.name]).toBeUndefined()
    })

    it('does not set components on entities that have not yet been added', function () {
      const notAdded = Entity.create()
      scene.setEntityComponent(notAdded, new C0)
      expect(scene._components[C0.name][notAdded.id]).toBeUndefined()
    })
  })

})
