// import InputHandler from './Input'
import config from './config'
import { Renderer } from './Renderer'
import { MakeErrorType, MakeLogger } from './util'


/**
 * Class Game
 */
class Game
{
  /**
   * @constructor
   */
  constructor() {
    const canvas = document.getElementById(config.canvas.id)
    const context = canvas.getContext('webgl2')

    const renderer = new Renderer({ canvas, context })

    Object.assign(this, {
      config,
      frameId:0,
      renderer,
    })
  }

  /**
   * The game loop
   * @param {{ t0:number, t1:number, state:Object }} args
   * @param {Object} args.t0 The time of the previous loop iteration
   * @param {Object} args.t1 The time of the current loop iteration
   * @param {Object} args.state The game state model
   */
  __loop__({ t0, t1, state:s0 })
  {
    const s1 = this.__update__({ dt: t1-t0, state:s0 })

    this.__draw__({ state: s1 })

    // this.running && window.requestAnimationFrame(time => this.__loop__({ t0:t1, t1:time, state:s1 }))
  }

  /**
   * Updates the game state data
   * @param {{ dt:number, state:Object }} args
   * @param {Object} args.dt The time elapsed since the previous update
   * @param {Object} args.state The game state model
   * @returns {Object} The updated state
   */
  __update__({ dt, state })
  {
    return state
  }

  /**
   * Draws the game state data
   * @param {{ state:Object }} args
   * @param {Object} args.state The game state model
   */
  __draw__({ state })
  {
    this.renderer.draw(state)
  }

  __resizeCanvas__()
  {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }



  /**
   * Starts the game loop
   */
  run()
  {
    // Log.debug('Loop disabled')
    this.running = true
    this.frameId = window.requestAnimationFrame(time => this.__loop__({ t0:0, t1:time, state:this.config }))
  }

  /**
   * Stops the game loop
   */
  stop()
  {
    this.running = false
    window.cancelAnimationFrame(this.frameId)
  }

  resizeEventHandler(event)
  {
    this.renderer.resizeCanvas()
  }

  unhandledRejectionEventHandler(event)
  {
    throw new GameError(event.reason)
  }
}


const GameError = MakeErrorType(Game)
const Log = MakeLogger(Game)

export { Game }
