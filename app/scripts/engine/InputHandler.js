import { MakeConstEnumerator,
         MakeErrorType,
         MakeLogger           } from './utilities'


/**
 * Handles mouse and keyboard input events
 *
 * @todo document input handlers
 */
export class InputHandler
{
  constructor(eventMap)
  {
    this._eventMap = eventMap ?? {}

    window.addEventListener('keydown', this.handleKeyDnEvent.bind(this))
    window.addEventListener('keyup',   this.handleKeyUpEvent.bind(this))
    window.addEventListener('click',   this.handleMouseClickEvent.bind(this))
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyDnEvent(event)
  {
    const eventName = this._eventMap?.keyboard?.[event.key]
    eventName && window.dispatchEvent(new CustomEvent(eventName, { detail: true }))
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyUpEvent(event)
  {
    const eventName = this._eventMap?.keyboard?.[event.key]
    eventName && window.dispatchEvent(new CustomEvent(eventName, { detail: false }))

  }

  /**
   * @param {MouseEvent} event
   */
  handleMouseClickEvent(e)
  {
    // if (event.button === MouseButton.LEFT)
    // {
    //   Log.debug(`MouseClick ${event.button}: [${event.x}, ${event.y}]`)
    // }
  }
}


/**
 * Enumerates mouse buttons 1-3
 * @enum {Number}
 * @property {Number} LEFT
 * @property {Number} MIDDLE
 * @property {Number} RIGHT
 * @readonly
 * @private
 */
const MouseButton = MakeConstEnumerator('MouseButton', [
  'LEFT',
  'MIDDLE',
  'RIGHT',
])


/**
 * @see {@link module:Util.MakeLogger}
 * @private
 */
const Log = MakeLogger(InputHandler)


/**
 * @see {@link module:Util.MakeErrorType}
 * @private
 */
const InputHandlerError = MakeErrorType(InputHandler)
