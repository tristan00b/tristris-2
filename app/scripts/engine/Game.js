import { MakeErrorType, MakeLogger } from '../engine/utilities'
import { Renderer } from '../engine/gfx/all'


/**
 * @typedef SceneConstructor
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @returns {Scene}
 */


/**
 * Creates an instance of the game
 */
export class Game
{
  /**
   *
   * @param {external:HTMLCanvasElement} canvas The canvas to render to
   * @param {SceneConstructor} EntryScene A constructor callback for initialising the entry scene
   */
  constructor(canvas, EntryScene) {
    this.canvas  = canvas
    this.context = this.canvas.getContext('webgl2')
    // this.input  = new InputHandler
    this.renderer = new Renderer(this)
    // this.audio  = new AudioServer(this)

    const scene = new EntryScene(this.context)
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
 const Log = MakeLogger(Game)


 /**
  * @see {@link module:Util.MakeErrorType}
  * @private
  */
 const GameError = MakeErrorType(Game)
