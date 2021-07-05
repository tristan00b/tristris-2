import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Scene } from '../app/scripts/engine/ecs/Scene'

describe('Scene', function () {

  class C0 {}
  class C1 {}
  class C2 {}
  class C3 {}

  describe('Scene.hasEntity', () => {

    it('reports whether an entity has been added to the scene', () => {
      const scene   = new Scene
      const entity0 = new Entity
      const entity1 = new Entity

      scene._entities[entity0.id] = entity0

      const expected = scene.hasEntity(entity0) && !scene.hasEntity(entity1)

      expect(expected).toBe(true)
    })
  })

  describe('Scene.addEntity', () => {

    it('Adds an entity to the scene', () => {
      const scene = new Scene
      const entity = new Entity

      scene.addEntity(entity)

      expect(scene.entities[entity.id]).toBeDefined()
    })
  })

  describe('Scene.isComponentTypeRegistered', () => {

    it('Reports whether a component type has been registered', () => {
      const scene = new Scene

      scene._components[C0.name] = []
      scene._components[C2.name] = []

      const expected =  scene.isComponentTypeRegistered(C0)
                    && !scene.isComponentTypeRegistered(C1)
                    &&  scene.isComponentTypeRegistered(C2)
                    && !scene.isComponentTypeRegistered(C3)

      expect(expected).toBe(true)
    })
  })

  describe('Scene.registerComponentType', () => {

    it('registers component types', () => {
      const scene = new Scene
      scene.registerComponentType(C0)
      scene.registerComponentType(C2)

      const expected =  scene._components[C0.name]
                    && !scene._components[C1.name]
                    &&  scene._components[C2.name]
                    && !scene._components[C3.name]

      expect(expected).toBe(true)
    })

    it ('does not re-register component types', () => {
      const scene = new Scene
      const success1 = scene.registerComponentType(C0)
      const success2 = scene.registerComponentType(C0)

      expect(success1 && !success2).toBe(true)
    })
  })

  describe('Scene.getEntityComponent', () => {

    it('gets entity all components that have been set', () => {
      const scene  = new Scene
      const entity = new Entity
      const types  = [C0, C1, C2]

      types.forEach(Type => {
        scene.registerComponentType(Type)
        scene._components[Type.name][entity.id] = new Type
      })

      const components = types.map(Type => scene.getComponent(entity, Type))

      const expected = components
        .reduce((acc, c, idx) => acc && scene._components[c.constructor.name][entity.id] instanceof c.constructor)

      expect(expected).toBe(true)
    })
  })

  describe('Scene.hasEntityComponent', () => {

    it ('tells whether and entity\'s component(s) have been set', function () {
      const scene = new Scene
      const entity = new Entity
      const types = [C0, C1, C2]

      types.forEach(Type => scene.registerComponentType(Type))
      types.forEach((Type, idx) => scene._components[Type.name][entity.id] = new Type)

      {
        // Nullish argument
        const expected = scene.hasComponent(entity, null)
                      && scene.hasComponent(entity, undefined)
        expect(expected).toBe(false)
      }

      {
        // Unregistered component argument
        expect(scene.hasComponent(entity, C3)).toBe(false)
      }

      {
        // Registered compuent argument
        expect(scene.hasComponent(entity, C0)).toBe(true)
      }
    })
  })

  describe('Scene.setEntityComponent', () => {

    const scene  = new Scene
    const entity = new Entity
    const types  = [C0, C1, C2]

    scene.addEntity(entity)
    types.forEach(Type => {
      scene.registerComponentType(Type)
    })

    it('sets all components whose types have been registered', function () {
      types.forEach(Type => scene.setComponent(entity, new Type))

      // expect(expected).toBe(true)
    })

    it('does not set components of unregistered types', function () {
      const c3 = new C3
      scene.setComponent(entity, c3)
      expect(scene._components[C3.name]).toBeUndefined()
    })

    it('does not set components on entities that have not yet been added', function () {
      const notAdded = new Entity
      scene.setComponent(notAdded, new C0)
      expect(scene._components[C0.name][notAdded.id]).toBeUndefined()
    })
  })

})
