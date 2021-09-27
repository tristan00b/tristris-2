import { makeTestScene } from './helpers'

import { Entity } from '../app/engine/ecs/Entity'
import { Query } from '../app/engine/ecs/Query'
import { Scene } from '../app/engine/ecs/Scene'
import { System } from '../app/engine/ecs/System'


class ComponentA {
  constructor () {
    this.prop = 1
  }
}

class ComponentB {
  constructor() {
    this.prop = 10
  }
}

describe('System', () => {

  const entityCount = 100
  const types = [ComponentA, ComponentB]
  const scene = makeTestScene(entityCount, ...types)

  it('applies a callback to entity components satisfied by a query', () => {

    const updateCallback = (deltaTime, componentA, componentB) => {
      componentA.prop += componentB.prop
    }

    const query  = (new Query(ComponentA, ComponentB)).run(scene)
    const system = new System(query, updateCallback)

    system.update()

    const allEqualEleven = query.components
      .map(([a, _]) => a.prop === 11)
      .reduce((acc, val) => acc && val)

    expect(allEqualEleven).toBe(true)
  })
})
