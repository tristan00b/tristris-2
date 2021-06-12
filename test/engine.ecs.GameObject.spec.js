import { GameObject } from '../app/scripts/engine/ecs/all'

describe('GameObject', function () {

  describe('GameObject.constructor', function () {

    it('is instantiated with a unique ID', function () {
      const length = 10
      const goIds  = Array(length).fill().map(_ => new GameObject).map(go => go.id)
      const allEqual = goIds.reduce((acc, goId, idx) => goId == (idx+1))
      expect(allEqual).toBe(true)
    })
  })
})
