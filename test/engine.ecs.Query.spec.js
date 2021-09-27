import { makeTestScene } from './helpers'

import { Query } from '../app/engine/ecs/Query'


describe('Query', function () {
  const entityCount = 100,
        C0 = class {},
        C1 = class {},
        C2 = class {},
        C3 = class {},
        types = [C0, C1, C2, C3]

  const scene = makeTestScene(entityCount, ...types)
  const query = (new Query(...types)).run(scene)

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
