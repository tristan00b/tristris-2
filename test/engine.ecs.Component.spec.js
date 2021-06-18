import { Component, MakeComponent } from '../app/scripts/engine/ecs/components/Component'
import { getPropertyDescriptors } from '../app/scripts/engine/utilities'

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
  const testComponent = new TestComponent()

  it('has it\'s name property derived from subclass\' name', function () {
    expect(TestComponent.name).toBe('TestComponent')
    expect(testComponent.name).toBe('TestComponent')
  })

  it('produces a subclass of Component', function () {
    expect(testComponent instanceof Component).toBe(true)
    expect(testComponent instanceof TestComponent).toBe(true)
  })

  it('preserves subclass members', function () {
    expect(testComponent._prop).toBeDefined()
  })

  it('preserves subclass methods', function () {
    expect(testComponent.fn).toBeDefined()
  })

  it('preserves subclass public fields', function () {
    expect(testComponent.public).toBeDefined()
  })

  it('preserves subclass private fields', function () {
    expect(testComponent.private).toBe('private')
  })

  it('preserves subclass static members', function () {
    expect(TestComponent.staticmem).toBeDefined()
  })

  it('preserves subclass static methods', function () {
    expect(TestComponent.staticfn).toBeDefined()
  })

  it('preserves subclass accessors', function () {
    expect(testComponent.prop).toBeDefined()
  })

  it('initalizes base class members', function () {
    expect(testComponent.isEnabled).toBeTruthy()
  })

  it('can disable/enable subclass methods', function () {
    testComponent.disable()
    expect(testComponent.fn()).toBeUndefined()

    testComponent.enable()
    expect(testComponent.fn()).toBe('fn')
  })
})
