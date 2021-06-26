import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Scene } from '../app/scripts/engine/ecs/Scene'

describe('Entity', () => {

    const entityCount = 3
    const entities = Array(entityCount).fill().map(_ => new Entity)

    it('creates an entity whose ID is defined', () => {
      expect(entities[0].id).toBeDefined()
    })

    it('creates entities with ascending ID values', () => {
      const result = entities.reduce((acc, entity, index) => acc && entity.id === String(index))
      expect(result).toBe(true)
    })
})
