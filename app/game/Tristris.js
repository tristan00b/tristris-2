import { Game } from '../engine/all'

import config from './config'

// import { MakeScene } from './scenes/01-ecs-demo.js'
// import { MakeScene } from './scenes/02-textures'
import { MakeScene } from './scenes/03-postprocessing'

export class Tristris extends Game
{
  constructor() {
    const canvas = document.getElementById(config.canvas.id)
    const context = canvas.getContext('webgl2') || new Error('failed to acquire WebGL 2 context')

    super(context, MakeScene(context))
  }
}
