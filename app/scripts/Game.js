import { mat4 } from 'gl-matrix'

// import InputHandler from './Input'
import { Camera } from './Camera'
import config from './config'
import { InputHandler } from './Input'
import { Mesh } from  './Mesh'
import { Model } from './Model'
import { Renderer } from './Renderer'
import { ShaderProgram } from './ShaderProgram'
import { shaders } from './shaders'
import { MakeErrorType, MakeLogger } from './Util'


import * as WebGL from './WebGL'
import WebGLUtil from './webgl/WebGLUtil'

/**
 * Class Game
 */
export class Game
{
  /**
   * @constructor
   */
  constructor() {
    this.canvas = document.getElementById(config.canvas.id)
    this.context = this.canvas.getContext('webgl2')
    //this.input = new InputHandler
    this.renderer = new Renderer(this)
    // this.audio = new AudioServer(this)

    const gl = this.context

    // -----------------------------------------------------------------------------------------------------------------
    /** @todo load entry scene */
    const shader = new ShaderProgram(gl,
      [gl.VERTEX_SHADER,   shaders.vsource],
      [gl.FRAGMENT_SHADER, shaders.fsource]
    )

    const vertices = [
      1.0,  1.0, 0.0,
     -1.0,  1.0, 0.0,
     -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
    ]
    const indices = [ 0,1,2,2,3,0 ]

    const mesh    = new Mesh({ vertices, indices, type: gl.TRIANGLES })
    const models  = [
      new Model({ gl, mesh, shader }),
      new Model({ gl, mesh, shader, transform: mat4.fromTranslation(mat4.create(), [-1, 0, 0]) })
    ]
    const camera  = new Camera
    camera.lookat = {
      eye: [0, 0, 10],
      up:  [0, 1,  0],
    }
    camera.perspective = {}

    models.forEach(model => {
      this.renderer.enqueue({ model, shader, camera })
    })
    // -----------------------------------------------------------------------------------------------------------------

    window.addEventListener('resize', this.resizeCanvas.bind(this))
    window.addEventListener('resize', camera.aspectFrom.bind(camera, this.canvas))
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

    this.running && window.requestAnimationFrame(time => this.__loop__({ t0:t1, t1:time, state:s1 }))
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
    this.renderer.draw(this.camera)
  }

  /**
   * Starts the game loop
   */
  run()
  {
    window.dispatchEvent(new Event('resize'))

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


  resizeCanvas()
  {
    WebGLUtil.resizeCanvas(this.context)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(Game)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const GameError = MakeErrorType(Game)
