import { Tristris as Game } from './scripts/Tristris'

window.addEventListener('load', async _ => {
  Promise.resolve(new Game())
    .then(game => game.run())
    .catch(e => console.error(e.message))
})
