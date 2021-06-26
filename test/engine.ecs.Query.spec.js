import { makeTestScene } from './helpers'

import { Component } from '../app/scripts/engine/ecs/components/Component'
import { Query } from '../app/scripts/engine/ecs/Query'


describe('Query', function () {
  const entityCount = 100,
        C0 = class extends Component {},
        C1 = class extends Component {},
        C2 = class extends Component {},
        C3 = class extends Component {},
        types = [C0, C2, C3]

  const scene = makeTestScene(entityCount, C0, C1, C2, C3)
  const query = new Query(scene, ...types)

  it('retrieves the desired component types', function () {

    // B. each component list contains an instance of each of the queried component types
    const innerReducer = (acc, component, idx)  => acc && component instanceof types[idx]

    // A. each component list contains exactly the number of queried component types
    const outerReducer = (acc, components) => acc
      && components.length == types.length
      && components.reduce(innerReducer)

    const allComponentsFound = query.components.reduce(outerReducer)

    expect(allComponentsFound).toBe(true)
  })
})
