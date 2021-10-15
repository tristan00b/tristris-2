import { Renderer   } from './gfx/all'
import { MakeLogger } from './utilities'


/**
 * Creates an instance of the game
 * @todo flesh out Game API
 * @todo document
 */
export class Game
{
  /**
   * @param {external:HTMLCanvasElement} canvas The canvas to render to
   * @param {Scene} entryScene The first scene to render
   */
  constructor(context, entryScene) {
    this._context  = context
    this._renderer = new Renderer(this._context)
    // this.audio  = new AudioServer(this)
    this._scene    = entryScene
  }

  /**
   * The game loop
   */
  loop(t0, t1)
  {
    this._scene.update(t1 - t0)
    this._renderer.render()
    this._running && window.requestAnimationFrame(t2 => this.loop(t1, t2))
  }

  /**
   * Starts the game loop
   */
  run()
  {
    if (this._scene)
    {
      this._renderer.enqueue(this._scene)
      this._running = true
      this._frameId = window.requestAnimationFrame(t1 => this.loop(0, t1))
    }
    else
    {
      Log.error('failed to start game loop: no entry scene')
    }
  }

  /**
   * Stops the game loop
   */
  stop()
  {
    this._running = false
    window.cancelAnimationFrame(this._frameId)
  }
}


/**
 * @see {@link module:Util.MakeLogger}
 * @private
 */
const Log = MakeLogger(Game)
