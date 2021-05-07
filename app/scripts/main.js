import { Game } from './Game'

window.addEventListener('load', async _ => {
  Promise.resolve(new Game())
    // .then(game => {
    //   window.addEventListener('resize', game.resizeEventHandler.bind(game))
    //   window.addEventListener('unhandledrejection', game.unhandledRejectionEventHandler.bind(game))
    //   return game
    // })
    .then(game => game.run())
    .catch(e => console.error(e.message))
})
