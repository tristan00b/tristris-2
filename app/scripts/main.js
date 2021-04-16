import config from './config'
import Game from './Game'

window.addEventListener('load', _ => {
  Promise.resolve(config)

    // 1. Get the canvas object
    .then(config => {
      const canvas = document.querySelector('#game-canvas')
      return canvas
        ? { config, canvas }
        : Promise.reject('[app] Error: unable to acquire canvas object')
    })

    // 2. Get the webgl context
    .then(({ config, canvas }) => {
      const context = canvas?.getContext('webgl')
      return context
        ? { config, canvas, context }
        : Promise.reject('[app] Error: unable to acquire webgl context')
    })

    // 3. Launch game
    .then(gameArgs => ( new Game(gameArgs) ).run())

    // Handle errors
    .catch(console.error)
})

window.addEventListener('unhandledrejection', event => {
  console.error(event.reason)
})
