import { InputHandler   } from './InputHandler'
import { Renderer       } from './gfx/all'
import { MakeErrorType,
         MakeLogger     } from './utilities'


/**
 * Creates an instance of the game
 */
export class Game
{
  /**
   * @param {external:HTMLCanvasElement} canvas The canvas to render to
   * @param {SceneConstructor} MakeEntryScene A constructor callback for initialising the entry scene
   */
  constructor(canvas, config, MakeEntryScene) {

    const gl = canvas.getContext('webgl2')
    if (!gl) throw new GameError('failed to obtain webgl2 context')

    this.context  = gl
    this.cfg      = config
    this.input    = new InputHandler(this.cfg?.input)
    this.renderer = new Renderer(this.context)
    // this.audio  = new AudioServer(this)

    this.scene = MakeEntryScene(this.context)
    this.renderer.enqueue(this.scene)
  }

  /**
   * @todo document game loop
   */
  loop(t0, t1)
  {
    this.scene.update(t1 - t0)
    this.renderer.render()
    this.running && window.requestAnimationFrame(t2 => this.loop(t1, t2))
  }

  /**
   * Updates the game state data
   * @param   {{ dt:number, state:Object }} args
   * @param   {Object} args.dt The time elapsed since the previous update
   * @param   {Object} args.state The game state model
   * @returns {Object} The updated state
   */
  update({ dt, state })
  {
    return state
  }

  /**
   * Starts the game loop
   */
  run()
  {
    this.running = true
    this.frameId = window.requestAnimationFrame(t1 => this.loop(0, t1))
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
