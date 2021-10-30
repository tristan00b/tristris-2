import { MakeErrorType,
         MakeLogger                 } from '../utilities'
import { MeshData,
         VertexAttributeType        } from './MeshData'
import { Renderable                 } from './Renderable'
import { RenderTask                 } from './RenderTask'
import { quad                       } from './meshes/quad'
import { ScreenBloomShader          } from './shaders/ScreenBloomShader'
import { ScreenBloomShader2         } from './shaders/ScreenBloomShader2'
import { Framebuffer,
         FramebufferAttachmentType,
         FramebufferDataDirection,
         Renderbuffer,
         Texture,
         Texture2D                  } from './WebGL/all'
import { onErrorThrowAs             } from './WebGL/utilities'


// ---------------------------------------------------------------------------------------------------------------------
// Constants
//

// Bloom Shaders
const BLOOM_SHADER0         = 0
const BLOOM_SHADER1         = 1

const MRT_FRAMEBUFFER       = 0
const PINGPONG_FRAMEBUFFER0 = 1
const PINGPONG_FRAMEBUFFER1 = 2

// HDR Framebuffer
const COLOUR_TEXTURE        = 0
const BRIGHTNESS_TEXTURE    = 1
const DEPTH_TEXTURE         = 2

// Bloom 0 Shader
// const COLOUR_TEXTURE     = 0 // already defined

// Bloom 1 Shader
const SCENE_TEXTURE         = 0
const BLOOM_TEXTURE         = 1


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

    // -----------------------------------------------------------------------------------------------------------------
    // Renderer Config
    //

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

    this._task_queue = []
    this._shader = null

    // -----------------------------------------------------------------------------------------------------------------
    // Screen-space structures
    //

    this.screen = {}

    // Shaders
    this.screen.shader = [
      new ScreenBloomShader(gl),
      new ScreenBloomShader2(gl),
    ]

    this.screen.shader[BLOOM_SHADER0].use(gl)
    this.screen.shader[BLOOM_SHADER0].setUniforms(gl, {
      'image': 0,
    })
    this.screen.shader[BLOOM_SHADER0].unuse(gl)

    this.screen.shader[BLOOM_SHADER1].use(gl)
    this.screen.shader[BLOOM_SHADER1].setUniforms(gl, {
      'scene': 0,
      'bloom': 1,
    })
    this.screen.shader[BLOOM_SHADER1].unuse(gl)

    // screen space quad
    this.screen.quad = new Renderable(gl, quad(-1, -1, 2, 2), this.screen.shader[0])

    // -----------------------------------------------------------------------------------------------------------------
    // Framebuffers
    //

    this.framebuffers = []

    const attachmentSpecs = [
      {
        name       : 'colour', // for testing
        type       : FramebufferAttachmentType.COLOUR+0,
        direction  : FramebufferDataDirection.READ_WRITE,
        datafmt    : gl.RGBA16F,
        pixelfmt   : gl.RGBA,
        datatype   : gl.FLOAT,
        minfilter  : gl.LINEAR,
        magfilter  : gl.LINEAR,
      },

      {
        name       : 'bright', // for testing
        type       : FramebufferAttachmentType.COLOUR+1,
        direction  : FramebufferDataDirection.READ_WRITE,
        datafmt    : gl.RGBA16F,
        pixelfmt   : gl.RGBA,
        datatype   : gl.FLOAT,
        minfilter  : gl.LINEAR,
        magfilter  : gl.LINEAR,
      },

      // { // Texture2D backed depth buffer attachment
      //   name       : 'depth', // for testing
      //   type       : FramebufferAttachmentType.DEPTH,
      //   datatype   : gl.UNSIGNED_INT,
      //   datafmt    : gl.DEPTH_COMPONENT24,
      //   pixelfmt   : gl.DEPTH_COMPONENT,
      //   minfilter  : gl.NEAREST,
      //   magfilter  : gl.NEAREST,
      // },

      { // Renderbuffer backed depth buffer attachment
        name       : 'depth', // for testing
        type       : FramebufferAttachmentType.DEPTH,
        direction  : FramebufferDataDirection.WRITE_ONLY,
        datafmt    : gl.DEPTH_COMPONENT24,
      }
    ]

    this.framebuffers[MRT_FRAMEBUFFER] = new Framebuffer(gl, ...attachmentSpecs)
    this.framebuffers[MRT_FRAMEBUFFER].bind(gl)
    this.framebuffers[MRT_FRAMEBUFFER].setDrawbuffers(gl, [ attachmentSpecs[0].type, attachmentSpecs[1].type ])
    this.framebuffers[MRT_FRAMEBUFFER].unbind(gl)

    this.framebuffers[PINGPONG_FRAMEBUFFER0] = new Framebuffer(gl, attachmentSpecs[0])
    this.framebuffers[PINGPONG_FRAMEBUFFER0].bind(gl)
    this.framebuffers[PINGPONG_FRAMEBUFFER0].setDrawbuffers(gl, [ attachmentSpecs[0].type ])
    this.framebuffers[PINGPONG_FRAMEBUFFER0].unbind(gl)

    this.framebuffers[PINGPONG_FRAMEBUFFER1] = new Framebuffer(gl, attachmentSpecs[0])
    this.framebuffers[PINGPONG_FRAMEBUFFER1].bind(gl)
    this.framebuffers[PINGPONG_FRAMEBUFFER1].setDrawbuffers(gl, [ attachmentSpecs[0].type ])
    this.framebuffers[PINGPONG_FRAMEBUFFER1].unbind(gl)

    // -----------------------------------------------------------------------------------------------------------------
    // Event listeners
    //

    window.addEventListener('resize', this.handleResize.bind(this))
    window.dispatchEvent(new Event('resize'))
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
    Texture.setActiveTexture(this.context, index)
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

    // Render Scene ----------------------------------------------------------------------------------------------------
    this.framebuffers[MRT_FRAMEBUFFER].bind(gl)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the scene into the MRT framebuffer
    this._task_queue.forEach(task => task.run(this))

    // Blur Frame ------------------------------------------------------------------------------------------------------
    {
      const iterations = 10;
      this.screen.shader[BLOOM_SHADER0].use(gl)

      for (let i=0, horizontal=true; i<iterations; i++)
      {
        this.framebuffers[PINGPONG_FRAMEBUFFER0 + horizontal].bind(gl)

        this.screen.shader[BLOOM_SHADER0].setUniforms(gl, { 'horizontal': horizontal })

        horizontal = !horizontal

        if (i === 0)
          this.framebuffers[MRT_FRAMEBUFFER].bindTexture(gl, BRIGHTNESS_TEXTURE)
        else
          this.framebuffers[PINGPONG_FRAMEBUFFER0 + horizontal].bindTexture(gl, COLOUR_TEXTURE)

        this.screen.quad.draw(gl)
      }
    }

    // Combine ---------------------------------------------------------------------------------------------------------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.screen.shader[BLOOM_SHADER1].use(gl)

    this.setActiveTexture(0)
    this.framebuffers[MRT_FRAMEBUFFER].bindTexture(gl, COLOUR_TEXTURE)

    this.setActiveTexture(1)
    this.framebuffers[PINGPONG_FRAMEBUFFER1].bindTexture(gl, COLOUR_TEXTURE)

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
    const gl  = this.context

    gl.canvas.width  = gl.canvas.clientWidth
    gl.canvas.height = gl.canvas.clientHeight

    const [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]

    this.framebuffers.forEach(framebuffer => {
      framebuffer.resize(gl, width, height)
    })

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
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
