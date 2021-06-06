import { mat4 } from 'gl-matrix'
import { MakeErrorType, MakeLogger } from '../engine/utilities'
import { Renderer } from '../engine/gfx/all'
import config from './config'
import { JustSpheresScene } from './scenes/just-balls'


/**
 * Creates an instance of the game
 */
export class Tristris
{
  constructor() {
    this.canvas   = document.getElementById(config.canvas.id)
    this.context  = this.canvas.getContext('webgl2')
    // this.input  = new InputHandler
    this.renderer = new Renderer(this)
    // this.audio  = new AudioServer(this)

    const scene = JustSpheresScene(this.context)

    this.renderer.enqueue(scene)
  }

  /**
   * @todo document game loop
   */
  __loop__(t0, t1)
  {
    // this.scene.update(t1 - t2)
    this.renderer.render()
    this.running && window.requestAnimationFrame(t2 => this.__loop__(t1, t2))
  }

  /**
   * Updates the game state data
   * @param   {{ dt:number, state:Object }} args
   * @param   {Object} args.dt The time elapsed since the previous update
   * @param   {Object} args.state The game state model
   * @returns {Object} The updated state
   */
  __update__({ dt, state })
  {
    return state
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


/**
 * @see {@link module:Util.MakeLogger}
 * @private
 */
const Log = MakeLogger(Tristris)


/**
 * @see {@link module:Util.MakeErrorType}
 * @private
 */
const TristrisError = MakeErrorType(Tristris)
