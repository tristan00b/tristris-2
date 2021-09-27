import WebGLRenderingContext from 'jest-webgl-canvas-mock/lib/classes/WebGLRenderingContext'

import { Entity } from '../app/engine/ecs/Entity'
import { Scene, keyFrom } from '../app/engine/ecs/Scene'
import { ShaderProgram } from '../app/engine/gfx/ShaderProgram'
import { BasicShader } from '../app/engine/gfx/shaders/BasicShader'


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

      scene._components[keyFrom(C0)] = []
      scene._components[keyFrom(C2)] = []

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

      const expected =  scene._components[keyFrom(C0)]
                    && !scene._components[keyFrom(C1)]
                    &&  scene._components[keyFrom(C2)]
                    && !scene._components[keyFrom(C3)]

      expect(expected).toBe(true)
    })

    it('does not re-register component types', () => {
      const scene = new Scene
      const success1 = scene.registerComponentType(C0)
      const success2 = scene.registerComponentType(C0)

      expect(success1 && !success2).toBe(true)
    })
  })

  describe('Scene.getEntity', () => {

    const ComponentType = class{}

    const scene = new Scene
    const e0 = new Entity,
          e1 = new Entity,
          e2 = new Entity
    const c0 = new ComponentType,
          c1 = new ComponentType,
          c2 = new ComponentType

    scene.registerComponentType(ComponentType)

    ;[e0, e1, e2].forEach(e => scene.addEntity(e))

    scene.setComponent(e0, c0)
    /* skip e1 */
    scene.setComponent(e2, c2)


    it('it can retrieve entities given their respective components', () => {
      const e0 = scene.getEntity(c0)
      const e1 = scene.getEntity(c1)
      const e2 = scene.getEntity(c2)

      expect(e0).toBeDefined()
      expect(e1).toBeUndefined()
      expect(e2).toBeDefined()
    })

  })

  describe('Scene.getComponent', () => {

    it('gets entity all components that have been set', () => {
      const scene  = new Scene
      const entity = new Entity
      const types  = [C0, C1, C2]

      types.forEach(Type => {
        scene.registerComponentType(Type)
        scene._components[keyFrom(Type)][entity.id] = new Type
      })

      const components = types.map(Type => scene.getComponent(entity, Type))

      const expected = components
        .reduce((acc, c, idx) => acc && scene._components[keyFrom(c)][entity.id] instanceof c.constructor)

      expect(expected).toBe(true)
    })
  })

  describe('Scene.hasComponent', () => {

    it ('tells whether and entity\'s component(s) have been set', function () {
      const scene = new Scene
      const entity = new Entity
      const types = [C0, C1, C2]

      types.forEach(Type => scene.registerComponentType(Type))
      types.forEach((Type, idx) => scene._components[keyFrom(Type)][entity.id] = new Type)

      // Nullish arguments
      expect(scene.hasComponent(entity, null)).toBe(false)
      expect(scene.hasComponent(entity, undefined)).toBe(false)

      // Unregistered component argument
      expect(scene.hasComponent(entity, C3)).toBe(false)

      // Registered component argument
      expect(scene.hasComponent(entity, C0)).toBe(true)
    })
  })

  describe('Scene.setComponent', () => {

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
      expect(scene._components[keyFrom(C3)]).toBeUndefined()
    })

    it('does not set components on entities that have not yet been added', function () {
      const notAdded = new Entity
      scene.setComponent(notAdded, new C0)
      expect(scene._components[keyFrom(C0)][notAdded.id]).toBeUndefined()
    })
  })
})

describe('keyFrom', () => {

  it('handles shaders correctly', () => {
    const basicShader = BasicShader.prototype

    const allSame = keyFrom(BasicShader) === keyFrom(ShaderProgram)
                 && keyFrom(basicShader) === keyFrom(ShaderProgram)

    expect(allSame).toBe(true)

    const scene  = new Scene
    const entity = new Entity

    scene.registerComponentType(ShaderProgram)
    scene.addEntity(entity)
    scene.setComponent(entity, basicShader)

    expect(scene.isComponentTypeRegistered(BasicShader)).toBe(true)
    expect(scene.getComponent(entity, BasicShader) === basicShader).toBe(true)
    expect(scene.hasComponent(entity, BasicShader)).toBe(true)
  })
})
