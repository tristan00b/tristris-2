import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Scene } from '../app/scripts/engine/ecs/Scene'

describe('Entity', function () {

  describe('Entity.create', function () {

    const en = Entity.create()

    it('creates an entity whose ID is defined', function () {
      expect(en.id).toBeDefined()
    })
  })


})
