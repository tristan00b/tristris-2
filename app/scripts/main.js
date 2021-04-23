import config from './config'
import { MakeErrorType } from './util'
import { Game } from './Game'

class App {}
const AppError = MakeErrorType(App)

window.addEventListener('load', async _ => {
  Promise.resolve(config)

    .then(config => {
      const canvas = document.querySelector(`#${config.canvas.id}`)
      return canvas
        ? { config, canvas }
        : Promise.reject(new AppError('unable to acquire canvas object'))
    })
    .then(args => new Game(args))
    .then(game => game.run())
    .catch(console.error)
})

window.addEventListener('unhandledrejection', event => {
  console.error(event.reason)
})
