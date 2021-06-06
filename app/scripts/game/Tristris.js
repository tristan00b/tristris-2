import { Game } from '../engine/all'

import config from './config'
import { JustSpheresScene } from './scenes/just-balls'

export class Tristris extends Game
{
  constructor() {
    const canvas = document.getElementById(config.canvas.id)
    super(canvas, JustSpheresScene)
  }
}
