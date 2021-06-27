import { Component } from '../app/scripts/engine/ecs/Component'
import { getPropertyDescriptors } from '../app/scripts/engine/utilities'

describe('MakeComponent', function () {

  class TestComponent extends Component { }
  const testComponent = new TestComponent

  it('declares itself to be a component type', function () {
    expect(TestComponent.isComponent).toBe(true)
    expect(testComponent.isComponent).toBe(true)
  })
})
