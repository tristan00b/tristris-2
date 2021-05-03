import { MakeErrorType, MakeLogger } from './util'
import { mat4 } from 'gl-matrix'
import { shaders } from './shaders'

import * as webgl from './webgl'
import WebGLUtil from './webgl/WebGLUtil'

/** @module Renderer */

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
      new webgl.Shader(gl, gl.VERTEX_SHADER, shaders.vsource),
      new webgl.Shader(gl, gl.FRAGMENT_SHADER, shaders.fsource)
    ]

    this.program = new webgl.Program(gl)
    this.program.attachShaders(gl, ...(this.shaders))
    this.program.linkProgram(gl)

    this.programInfo = {
      program: this.program,
      attrs: {
        position: gl.getAttribLocation(this.program.location, 'vertex_position')
      },
      unifs: {
        modelViewMatrix: gl.getUniformLocation(this.program.location, 'model_view_matrix')
      , projectionMatrix: gl.getUniformLocation(this.program.location, 'projection_matrix')
      }
    }

    Log.debug(this.programInfo.attrs.position)

    const vertices = [
       0.5,  0.5, 0.0,
      -0.5,  0.5, 0.0,
      -0.5, -0.5, 0.0,
       0.5, -0.5, 0.0,
    ]

    const indices = [ 0,1,2,2,3,0 ]

    this.vao = new webgl.VertexArray(gl)
    this.vao.bind(gl)
      this.buffer = new webgl.ArrayBuffer(gl)
      this.buffer.bind(gl)
      this.buffer.data(gl, new Float32Array(vertices), gl.STATIC_DRAW)

      this.indices = new webgl.ElementArrayBuffer(gl)
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
    WebGLUtil.needCanvasResize(gl) && WebGLUtil.resizeCanvas(gl)

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw
    this.program.use(gl)
    this.vao.bind(gl)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0)
    this.vao.unbind(gl)
  }

}

/** @see {@link util.MakeLogger} */
var Log = MakeLogger(Renderer)

/** @see {@link util.MakeErrorType} */
const RendererError = MakeErrorType(Renderer)
