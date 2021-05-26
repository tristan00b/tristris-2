import { MakeErrorType, MakeLogger } from '../utilities'


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
 * @enum {number}
 * @private
 * @readonly
 */
 const MouseButton = Object.freeze({
  LEFT   : 0,
  MIDDLE : 1,
  RIGHT  : 2
})


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
