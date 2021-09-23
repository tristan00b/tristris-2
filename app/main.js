import { Tristris as App } from './scripts/game/Tristris'

window.addEventListener('load', async _ => {
  try {
    const app = new App()
    app.run()
  } catch (e) {
    console.error(e)
  }
})
