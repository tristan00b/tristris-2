import { mat4 } from 'gl-matrix'

// import { Camera } from './Camera'
// import { InputHandler } from './Input'
// import { Mesh } from  './Mesh'
// import { MeshData, VertexAttributeType } from './MeshData'
// import { Renderer } from './Renderer'
// import { SceneGraph } from './SceneGraph'
// import { SceneNode } from './SceneNode'
// import { ShaderProgram } from './ShaderProgram'
import { MakeErrorType, MakeLogger } from './engine/utilities'
// import WebGL from './WebGL'

import {
  Camera,
  Mesh,
  MeshData,
  Renderer,
  ShaderProgram,
  SceneGraph,
  SceneNode,
  VertexAttributeType,
  WebGL
} from './engine/gfx/all'

import config from './config'


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

    const gl = this.context

    // -----------------------------------------------------------------------------------------------------------------
    /** @todo load entry scene */
    const shader = new ShaderProgram(gl,
      {
        type:     gl.VERTEX_SHADER,
        source:  `#version 300 es
                  in vec4 vertex_position;

                  uniform mat4 model_matrix;
                  uniform mat4 view_matrix;
                  uniform mat4 projection_matrix;

                  void main() {
                    gl_Position = projection_matrix * view_matrix * model_matrix * vertex_position;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  out vec4 out_color;

                  void main() {
                    out_color = vec4(1.0, 1.0, 1.0, 1.0);
                  }`
      }
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
        { type: VertexAttributeType.POSITION, size: 3 }
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

    window.addEventListener('resize', camera.setAspect.bind(camera, this.canvas))
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
