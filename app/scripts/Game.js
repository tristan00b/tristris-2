import { mat4 } from 'gl-matrix'

import { Camera } from './Camera'
import { InputHandler } from './Input'
import { Mesh } from  './Mesh'
import { MeshData, VertexAttributes } from './MeshData'
import { Renderer } from './Renderer'
import { SceneGraph } from './SceneGraph'
import { SceneNode } from './SceneNode'
import { ShaderProgram } from './ShaderProgram'
import { shaders } from './shaders'
import { MakeErrorType, MakeLogger } from './Util'

import config from './config'
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

    const data = new MeshData({
      vertices: [
        1.0,  1.0, 0.0,
       -1.0,  1.0, 0.0,
       -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
      ],
      indices: [ 0,1,2,2,3,0 ],
      primtype: gl.TRIANGLES,
      attribs: [
        { type: VertexAttributes.POSITION, size: 3 }
      ],
    })

    const mesh = new Mesh({ gl, data, shader })

    const camera  = new Camera
    camera.lookat = {
      eye: [0, 0, 10],
      up:  [0, 1,  0],
    }
    camera.perspective = {}

    const n0 = new SceneNode({ shader })
    const n1 = new SceneNode({ mesh })
    const n2 = new SceneNode({ mesh }).setWorldTransform(mat4.fromTranslation(mat4.create(), [-1, -0.5, 0]))

    n0.addChildren(n1, n2)

    const scene = new SceneGraph({ root: n0, camera })

    this.renderer.enqueue(scene)
    // -----------------------------------------------------------------------------------------------------------------

    window.addEventListener('resize', this.resizeCanvas.bind(this))
    window.addEventListener('resize', camera.aspectFrom.bind(camera, this.canvas))
  }


  __loop__(t0, t1)
  {
    // this.scene.update(t1 - t2)
    this.renderer.render()
    this.running && window.requestAnimationFrame(t2 => this.__loop__(t1, t2))
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
