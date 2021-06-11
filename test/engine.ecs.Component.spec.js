import { Component, MakeComponent } from '../app/scripts/engine/ecs/Component'

describe('MakeComponent', function () {

    class _TestComponent
    {
      public = 'public'
      #private = 'private'

      static staticmem = 'staticmember'
      static staticfn() { return 'staticfn' }

      constructor()
      {
        this._prop = 'prop'
        this._private = this.#private ?? 'private field not set'
      }

      get prop()    { return this._prop    }
      set prop(x)   { this._prop = x       }
      get private() { return this._private }

      fn() { return 'fn' }
    }

    const TestComponent = MakeComponent(_TestComponent)
    const component = new TestComponent()

    it('has it\'s name property derived from subclass\' name', function () {
      const DerivedClass = MakeComponent(_TestComponent)
      expect(DerivedClass.name).toBe('TestComponent')
    })

    it('produces a subclass of Component', function () {
      expect(component instanceof Component).toBe(true)
      expect(component instanceof TestComponent).toBe(true)
    })

    it('preserves subclass members', function () {
      expect(component._prop).toBeDefined()
    })

    it('preserves subclass methods', function () {
      expect(component.fn).toBeDefined()
    })

    it('preserves subclass public fields', function () {
      expect(component.public).toBeDefined()
    })

    it('preserves subclass private fields', function () {
      expect(component.private).toBe('private')
    })

    it('preserves subclass static members', function () {
      expect(TestComponent.staticmem).toBeDefined()
    })

    it('preserves subclass static methods', function () {
      expect(TestComponent.staticfn).toBeDefined()
    })

    it('preserves subclass accessors', function () {
      expect(component.prop).toBeDefined()
    })

    it('initalizes base class members', function () {
      expect(component.isEnabled).toBeTruthy()
    })

    it('can disable/enable subclass methods', function () {
      component.disable()
      expect(component.fn()).toBeUndefined()

      component.enable()
      expect(component.fn()).toBe('fn')
    })
})
