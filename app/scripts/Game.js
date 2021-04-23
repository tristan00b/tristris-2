// import InputHandler from './Input'
import { Renderer } from './Renderer'

/**
 * Class GameError
 * @extends Error
 * @param {String} msg The error message
 */
export const GameError = class extends Error {
  toString() { return `${this.name}: ${this.message}` }
}

/**
 * Class Game
 */
export class Game
{
  /**
   * @constructor
   * @param {{ config: Object, canvas: Object }} args
   * @param {Object} args.config The game config data
   * @param {Object} args.canvas HTML canvas object
   * @throws {GameError} Throws if either elt of args is missing
   */
  constructor({ config, canvas }) {
    this.config = config ?? throw new GameError('config not supplied')
    this.canvas = canvas ?? throw new GameError('canvas not supplied')
    this.context = canvas?.getContext('webgl2') ?? throw new GameError('failed to acquire context')
    this.frameId  = 0

    this.renderer = new Renderer(this)
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

    if (this.running) window.requestAnimationFrame(time => this.__loop__({ t0:t1, t1:time, state:s1 }))
  }

  /**
   * Updates the game state data
   * @param {{ dt:number, state:Object }} args
   * @param {Object} args.dt The time elapsed since the previous update
   * @param {Object} args.state The game state model
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

  /**
   * Starts the game loop
   */
  run()
  {
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
}
