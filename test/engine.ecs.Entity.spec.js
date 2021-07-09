import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Scene } from '../app/scripts/engine/ecs/Scene'

describe('Entity', () => {

  const entities     = [new Entity, new Entity, new Entity]
  const entityFromId = Entity.fromId(9000)

  entities.push(new Entity)

  it('creates an entity whose ID is defined', () => {
    expect(entities[0].id).toBeDefined()
  })

  it('creates entities with ascending ID values', () => {
    const result = entities.reduce((acc, entity, index) => acc && entity.id === String(index))
    expect(result).toBe(true)
  })

  it('can create an instance from an ID', () => {
    expect(entityFromId.id).toEqual('9000')
  })

  it('does not interrupt the sequence of generated ID\'s when an instance is created from a given ID', () => {
    const [idj, idk] = entities.slice(-2).map(e => parseInt(e.id))
    expect(idj === idk-1).toBe(true)
  })
})
