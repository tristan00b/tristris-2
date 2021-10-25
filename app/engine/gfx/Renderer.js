import { Renderable           } from './Renderable'
import { RenderTask           } from './RenderTask'
import { MeshData,
         VertexAttributeType  } from './MeshData'
import { quad                 } from './meshes/quad'
import { ScreenBloomShader    } from './shaders/ScreenBloomShader'
import { ScreenBloomShader2   } from './shaders/ScreenBloomShader2'
import { FrameBuffer          } from './WebGL/FrameBuffer'
import { RenderBuffer         } from './WebGL/RenderBuffer'
import { Texture2D            } from './WebGL/Texture2D'
import { onErrorThrowAs,
         resizeCanvas         } from './WebGL/utilities'
import { MakeErrorType,
         MakeLogger           } from '../utilities'

/**
 * Manages drawing the elements of enqueued `SceneGraph` objects
 */
export class Renderer
{
  /**
   * @param {external:WebGL2RenderingContext} context The rendering context
   * @throws {RendererError} Throws a if either the `canvas` or `context` argument is not provided
   * @todo Devise configuration scheme
   */
  constructor(context)
  {
    this.context = context ?? throw new RendererError('reference to the context not supplied')

    const gl = this.context

    { // Webgl2 setup
      gl.enable(gl.CULL_FACE)
      gl.enable(gl.DEPTH_TEST)
      gl.frontFace(gl.CCW)
      gl.cullFace(gl.BACK)
      gl.clearDepth(1.0)

      this._extensions = {}
      const extensions = gl.getSupportedExtensions()

      const floatColourBufferExt = 'EXT_color_buffer_float'
      if (extensions.includes(floatColourBufferExt))
      {
        const ext = gl.getExtension(floatColourBufferExt)
        this._extensions[floatColourBufferExt] = ext
      }
      else
      {
        throw new RendererError('Floating point colour buffer extension not available!')
      }
    }

    //this._maxActiveTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
    this._task_queue = []
    this._shader = null

    // -----------------------------------------------------------------------------------------------------------------
    // Configure screen-space structures
    //------------------------------------------------------------------------------------------------------------------
    this.screen = {}
    const [ width, height ] = [gl.canvas.clientWidth, gl.canvas.clientHeight]

    // Shaders
    this.screen.shader = [
      new ScreenBloomShader(gl),
      new ScreenBloomShader2(gl),
    ]

    this.screen.shader[0].use(gl)
    this.screen.shader[0].setUniforms(gl, {
      'image': 0,
    })

    this.screen.shader[0].unuse(gl)
    this.screen.shader[1].use(gl)
    this.screen.shader[1].setUniforms(gl, {
      'scene': 0,
      'bloom': 1,
    })
    this.screen.shader[1].unuse(gl)

    this.framebuffer = [
      new FrameBuffer(gl),        // HDR buffer
      new FrameBuffer(gl),        // ping-pong buffer 1
      new FrameBuffer(gl),        // ping-pong buffer 2
    ]

    this.screen.texture = [
      new Texture2D(gl),          // HDR colour texture 0
      new Texture2D(gl),          // HDR colour texture 1
      new Texture2D(gl),          // HDR depth texture
      new Texture2D(gl),          // ping-pong texture 0
      new Texture2D(gl),          // pint-pong texture 1
    ]

    this.screen.quad = new Renderable(gl, quad(-1, -1, 2, 2), this.screen.shader[0])

    // -----------------------------------------------------------------------------------------------------------------
    // Configure (MRT) colour framebuffer
    //

    // Configure colour texture 0
    this.screen.texture[0].bind(gl)
    this.screen.texture[0].setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    this.screen.texture[0].setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.screen.texture[0].setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    this.screen.texture[0].setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.screen.texture[0].setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
    this.screen.texture[0].unbind(gl)

    // Configure colour texture 1
    this.screen.texture[1].bind(gl)
    this.screen.texture[1].setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    this.screen.texture[1].setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.screen.texture[1].setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    this.screen.texture[1].setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.screen.texture[1].setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
    this.screen.texture[1].unbind(gl)

    // Configure renderbuffer
    this.screen.renderbuffer = new RenderBuffer(gl)
    this.screen.renderbuffer.bind(gl)
    this.screen.renderbuffer.setStorage(gl, gl.DEPTH_COMPONENT24, width, height)
    this.screen.renderbuffer.unbind(gl)

    // console.log(gl.isRenderbuffer(this.screen.renderbuffer.location))

    // Configure the framebuffer
    this.framebuffer[0].bind(gl)
    this.framebuffer[0].setAttachment(gl, gl.COLOR_ATTACHMENT0, this.screen.texture[0]);
    this.framebuffer[0].setAttachment(gl, gl.COLOR_ATTACHMENT1, this.screen.texture[1]);
    this.framebuffer[0].setAttachment(gl, gl.DEPTH_ATTACHMENT, this.screen.renderbuffer);


    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])

    { // Check framebuffer status
      onErrorThrowAs(gl, RendererError)
      const status = this.framebuffer[0].getStatus(gl)
      status === gl.FRAMEBUFFER_COMPLETE || throw new RendererError(`framebuffer incomplete (status: ${status})`)
    }

    this.framebuffer[0].unbind(gl)

    // -----------------------------------------------------------------------------------------------------------------
    // Configure ping-pong blur framebuffers
    //

    // Configure ping-pong texture 0
    this.screen.texture[2].bind(gl)
    this.screen.texture[2].setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    this.screen.texture[2].setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.screen.texture[2].setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    this.screen.texture[2].setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.screen.texture[2].setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
    this.screen.texture[2].unbind(gl)

    // Configure ping-pong framebuffer 0
    this.framebuffer[1].bind(gl)
    this.framebuffer[1].setAttachment(gl, gl.COLOR_ATTACHMENT0, this.screen.texture[2])

    gl.drawBuffers([gl.COLOR_ATTACHMENT0])

    { // Check framebuffer status
      onErrorThrowAs(gl, RendererError)
      const status = this.framebuffer[1].getStatus(gl)
      status === gl.FRAMEBUFFER_COMPLETE || throw new RendererError(`framebuffer incomplete (status: ${status})`)
    }

    this.framebuffer[1].unbind(gl)

    // Configure ping-pong texture 1
    this.screen.texture[3].bind(gl)
    this.screen.texture[3].setIntegerParam(gl, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    this.screen.texture[3].setIntegerParam(gl, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.screen.texture[3].setIntegerParam(gl, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    this.screen.texture[3].setIntegerParam(gl, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.screen.texture[3].setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
    this.screen.texture[3].unbind(gl)

    // Configure ping-pong framebuffer 1
    this.framebuffer[2].bind(gl)
    this.framebuffer[2].setAttachment(gl, gl.COLOR_ATTACHMENT0, this.screen.texture[3])

    gl.drawBuffers([gl.COLOR_ATTACHMENT0])

    { // Check framebuffer status
      onErrorThrowAs(gl, RendererError)
      const status = this.framebuffer[2].getStatus(gl)
      status === gl.FRAMEBUFFER_COMPLETE || throw new RendererError(`framebuffer incomplete (status: ${status})`)
    }

    this.framebuffer[2].unbind(gl)

    // -----------------------------------------------------------------------------------------------------------------


    window.addEventListener('resize', this.handleResize.bind(this))
    window.dispatchEvent(new Event('resize'))
  }

  /**
   * @type {Number}
   */
  get maxActiveTextureUnits()
  {
    return this._maxActiveTextureUnits
  }

  /**
   * Specifies which texture unit to make active
   * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
   * @param {Number} index
   * @throws {RendererError}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture}
   */
  setActiveTexture(index)
  {
    const gl = this.context
    gl.activeTexture(gl.TEXTURE0 + index)
    onErrorThrowAs(gl, RendererError)
  }

  /**
   * Gets the currently set shader if one has been set
   * @type {ShaderProgram}
   */
  get shader()
  {
    return this._shader
  }

  set shader(shader)
  {
    this._shader = shader
  }

  /**
   * Sets the active shader for RenderTasks to be able to reference (typically called via a preceding
   * render task in a sequence of render tasks, as produced by {@link RenderTask.parseScene})
   * @param {ShaderProgram} shader An instance of ShaderProgram or subclass of ShaderProgram
   * @returns {this}
   */
  setShader(shader)
  {
    this.shader = shader
    return this
  }

  /**
   * Reports whether the renderer currently has a shader set
   * @type {Boolean}
   */
  get isShaderSet()
  {
    return !!this.shader
  }

  /**
   * Tells the renderer to use the currently set shader if one has been set
   * @returns {this}
   */
  useShader()
  {
    if (this.isShaderSet)
    {
      this.shader.use(this.context)
    }
    return this
  }

  /**
   * Tells the renderer to unuse the currently set shader if one has been set
   * @returns {this}
   */
  unuseShader()
  {
    if (this.isShaderSet)
    {
      this.shader.use(null)
    }
    return this
  }

  /**
   * Queries the scene for the sequence of `RenderTask` objects required to render the scene
   * @param {SceneGraph} scene
   */
  enqueue(scene)
  {
    const tasks = RenderTask.parseScene(scene)
    // tasks.forEach(t => console.log(t.description))
    this._task_queue.push(...tasks)
  }

  /**
   * Executes the sequence of enqueued `RenderTask` objects
   */
  render()
  {
    const gl = this.context
    const [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Render Scene ----------------------------------------------------------------------------------------------------
    this.framebuffer[0].bind(gl)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the scene into the bound framebuffer
    this._task_queue.forEach(task => task.run(this))

    this.framebuffer[0].unbind(gl);

    // Blur Frame ------------------------------------------------------------------------------------------------------
    {
      const iterations = 10;
      this.screen.shader[0].use(gl)

      let framebuffer = null

      for (let i=0, horizontal=true; i<iterations; i++)
      {
        framebuffer = this.framebuffer[1 + horizontal].bind(gl) // int + boolean...¯\_(ツ)_/¯

        this.screen.shader[0].setUniforms(gl, {
          'horizontal': horizontal
        })

        horizontal = !horizontal

        if (i === 0)
          this.screen.texture[1].bind(gl)
        else
          this.screen.texture[2 + horizontal].bind(gl)

        this.screen.quad.draw(gl)
      }
    }

    // Combine ---------------------------------------------------------------------------------------------------------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.screen.shader[1].use(gl)

    gl.activeTexture(gl.TEXTURE0)
    this.screen.texture[0].bind(gl)

    gl.activeTexture(gl.TEXTURE1)
    this.screen.texture[3].bind(gl)

    this.screen.quad.draw(gl)
  }

  /**
   * Clears the render task queue
   */
  clear()
  {
    this._task_queue = []
  }

  /**
   * A callback for handling window resize events
   * @private
   */
  handleResize()
  {
    this.resizeCanvas()
    this.resizeFrameBuffer()
  }

  /**
   * Updates canvas width and height dimensions to match client with and height dimensions
   * @private
   */
  resizeCanvas()
  {
    resizeCanvas(this.context)
  }

  /**
   * Updates the framebuffer's texture width and height dimensions to match drawing buffer width and height dimensions
   * @private
   */
  resizeFrameBuffer()
  {
    const gl = this.context
    const [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]

    this.screen.texture.forEach(texture => {
      texture.bind(gl)
      texture.setData(gl, 0, gl.RGBA16F, width, height, gl.RGBA, gl.FLOAT, null)
      texture.unbind(gl)
    })

    this.screen.renderbuffer.bind(gl)
    this.screen.renderbuffer.setStorage(gl, gl.DEPTH_COMPONENT24, width, height)
    this.screen.renderbuffer.unbind(gl)
  }
}


/**
 * @see {@link module:Engine/Utilities.MakeLogger}
 * @private
 */
var Log = MakeLogger(Renderer)


/**
 * @see {@link module:Engine/Utilities.MakeErrorType}
 * @private
 */
const RendererError = MakeErrorType(Renderer)
