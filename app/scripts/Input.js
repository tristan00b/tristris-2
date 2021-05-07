import { MakeErrorType, MakeLogger } from './Util'


/**
 * Handles mouse and keyboard input events
 */
export class InputHandler
{
  /**
   * @constructor
   */
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
 * @private
 * @see {@link util.MakeLogger}
 */
const Log = MakeLogger(InputHandler)


/**
 * @private
 * @see {@link util.MakeErrorType}
 */
const InputHandlerError = MakeErrorType(InputHandler)
