import { Entity } from '../app/engine/ecs/Entity'
import { Scene } from '../app/engine/ecs/Scene'

export function makeTestScene(entityCount, ...types)
{
  const scene = new Scene

  types.forEach(Type => {
    scene.registerComponentType(Type)
  })

  const entities = Array(entityCount).fill().map(_ => new Entity)

  entities.forEach(e => {
    scene.addEntity(e)
    types.forEach(Type => scene.setComponent(e, new Type))
  })

  return scene
}
