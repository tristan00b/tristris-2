import { Entity } from '../app/scripts/engine/ecs/Entity'
import { Scene } from '../app/scripts/engine/ecs/Scene'

export function makeTestScene(entityCount, ...types)
{
  const scene = new Scene
  const entities = Array(entityCount).fill().map(_ => new Entity)

  scene.addEntity(...entities)
  scene.registerComponentType(...types)

  for (const type of types)
  for (const e of entities)
  {
    scene.setEntityComponent(e, new type)
  }

  return scene
}
