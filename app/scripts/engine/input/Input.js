import { MakeConstEnumerator, MakeErrorType, MakeLogger } from '../utilities'


/**
 * Handles mouse and keyboard input events
 *
 * @todo document input handlers
 */
export class InputHandler
{
  constructor()
  {
    document.addEventListener('keydown', this.handleKeyDnEvent)
    document.addEventListener('keyup',   this.handkeKeyUpEvent)
    document.addEventListener('click', this.handleMouseClickEvent)
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyDnEvent(event)
  {
    Log.debug(event)
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyUpEvent(event)
  {
    Log.debug(event)
  }

  /**
   * @param {MouseEvent} event
   */
  handleMouseClickEvent(event)
  {
    if (event.button === MouseButton.LEFT) {
      Log.debug(`MouseClick ${event.button}: [${event.x}, ${event.y}]`)
    }
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
