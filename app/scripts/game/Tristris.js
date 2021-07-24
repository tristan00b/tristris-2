import { Game } from '../engine/all'

import config from './config'
import { MakeScene } from './scenes/MovingSpheres'

export class Tristris extends Game
{
  constructor() {
    const canvas = document.getElementById(config.canvas.id)
    super(canvas, MakeScene)
  }
}
