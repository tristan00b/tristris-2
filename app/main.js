import { Tristris as Game } from './game/Tristris'

window.addEventListener('load', async _ => {
  try {
    const game = new Game()
    game.run()
  } catch (e) {
    console.error(e)
  }
})
