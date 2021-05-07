import { MakeErrorType, MakeLogger } from './Util'
import { mat4 } from 'gl-matrix'
import { shaders } from './shaders'

import * as WebGL from './WebGL'
import WebGLUtil from './webgl/WebGLUtil'

import { Camera } from './Camera'


/**
 * @class
 */
export class Renderer
{
  /**
   * @constructor
   * @param {{ config:Object, canvas:Object }} args
   * @param {Object} args.config
   * @param {Object} args.canvas
   * @throws {RendererError}
   */
  constructor({ canvas, context })
  {
    this.canvas = canvas ?? throw new RendererError('reference to canvas object not supplied')
    this.context = context ?? throw new RendererError('reference to the context not supplied')
    this.__init__()
  }

  /**
   * WebGL initialization
   * @throws Will throw if a WebGL error occurs
   */
  __init__()
  {
    const gl = this.context

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    gl.enable(gl.DEPTH_TEST)
    gl.clearDepth(1.0)
    gl.clearColor(0,0,0,1)

    this.shaders = [
      new WebGL.Shader(gl, gl.VERTEX_SHADER, shaders.vsource),
      new WebGL.Shader(gl, gl.FRAGMENT_SHADER, shaders.fsource)
    ]

    this.program = new WebGL.Program(gl)
    this.program.attachShaders(gl, ...(this.shaders))
    this.program.linkProgram(gl)

    this.programInfo = {
      attrs: {
        position: gl.getAttribLocation(this.program.location, 'vertex_position')
      },
      unifs: {
        screenResolution: gl.getUniformLocation(this.program.location, 'screen_resolution'),
        modelViewMatrix:  gl.getUniformLocation(this.program.location, 'model_view_matrix'),
        projectionMatrix: gl.getUniformLocation(this.program.location, 'projection_matrix'),
      }
    }

    this.camera = new Camera(gl)
    this.modelViewMatrix = mat4.create(/* identity */)

    const vertices = [
       1000.0,  1000.0, 0.1,
      -1000.0,  1000.0, 0.1,
      -1000.0, -1000.0, 0.1,
       1000.0, -1000.0, 0.1,
    ]

    const indices = [ 0,1,2,2,3,0 ]

    this.vao = new WebGL.VertexArray(gl)
    this.vao.bind(gl)
      this.buffer = new WebGL.ArrayBuffer(gl)
      this.buffer.bind(gl)
      this.buffer.data(gl, new Float32Array(vertices), gl.STATIC_DRAW)

      this.indices = new WebGL.ElementArrayBuffer(gl)
      this.indices.bind(gl)
      this.indices.data(gl, new Uint32Array(indices), gl.STATIC_DRAW)

      this.vao.enableAttribute(gl, this.programInfo.attrs.position)
      this.vao.defineAttributePointer(gl, this.programInfo.attrs.position, 3, gl.FLOAT)
    this.vao.unbind(gl)
  }

  /**
   * Draws the game state model
   * @param {Object} model
   */
  draw(state)
  {
    const gl = this.context

    // Resize canvas as needed
    WebGLUtil.needCanvasResize(gl) && do {
      WebGLUtil.resizeCanvas(gl)
      this.camera = new Camera(gl)
    }

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw
    this.program.use(gl)
    this.vao.bind(gl)
      gl.uniform4f(this.programInfo.unifs.screenResolution, gl.canvas.width, gl.canvas.height, 1.0, 1.0)
      gl.uniformMatrix4fv(this.programInfo.unifs.modelViewMatrix,  false, this.modelViewMatrix)
      gl.uniformMatrix4fv(this.programInfo.unifs.projectionMatrix, false, this.camera.projectionMatrix)
      gl.uniformMatrix4fv(this.programInfo.unifs.projectionMatrix, false, this.modelViewMatrix)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0)
    this.vao.unbind(gl)
  }
}


/**
 * @private
 * @see {@link util.MakeLogger}
 */
var Log = MakeLogger(Renderer)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const RendererError = MakeErrorType(Renderer)
