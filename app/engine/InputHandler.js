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
    this._kbdEvents = eventMap?.keyboard || {}
    this._mseEvents = eventMap?.mouse    || {}

    window.addEventListener('keydown',   this.handleKeyDnEvent.bind(this))
    window.addEventListener('keyup',     this.handleKeyUpEvent.bind(this))
    window.addEventListener('mousedown', this.handleMouseDnEvent.bind(this))
    window.addEventListener('mouseup',   this.handleMouseUpEvent.bind(this))
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyDnEvent(event)
  {
    event.stopPropagation()
    const name = this._kbdEvents[event.key]
    name && window.dispatchEvent(new CustomEvent(name, { detail: { state: true } }))
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyUpEvent(event)
  {
    const name = this._kbdEvents[event.key]
    event.stopPropagation()
    name && window.dispatchEvent(new CustomEvent(name, { detail: { state: false } }))
  }

  /**
   * @param {MouseEvent} event
   */
  handleMouseDnEvent(event)
  {
    const name = this._mseEvents[event.button]
    event.stopPropagation()
    name && window.dispatchEvent(new CustomEvent(name))
  }

  /**
   * @param {MouseEvent} event
   */
  handleMouseUpEvent(event)
  {
    event.stopPropagation()
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
