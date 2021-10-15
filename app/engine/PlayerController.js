import { vec3 } from 'gl-matrix'
import { clip } from './utilities'

export class PlayerController
{
  constructor(context, camera)
  {
    this._isMovingForward  = false
    this._isMovingLeft     = false
    this._isMovingBack     = false
    this._isMovingRight    = false

    const center = vec3.sub([], camera.at, camera.eye)
    const h = Math.hypot(...center)
    this._yaw   = -Math.acos(center[0]/h)
    this._pitch =  Math.asin(center[1]/h)

    window.addEventListener('player/fwd', this.setForwardMovementState.bind(this))
    window.addEventListener('player/lft', this.setLeftMovementState   .bind(this))
    window.addEventListener('player/rgt', this.setRightMovementState  .bind(this))
    window.addEventListener('player/bck', this.setBackMovementState   .bind(this))
    window.addEventListener('player/up',  this.setUpMovementState     .bind(this))
    window.addEventListener('player/dn',  this.setDownMovementState   .bind(this))
    window.addEventListener('mousemove',  this.setLookDirection       .bind(this, context, camera))
    window.addEventListener('lmb',        this.togglePointerLock      .bind(this, context))
  }

  get isMovingForward() { return this._isMovingForward }
  get isMovingLeft   () { return this._isMovingLeft    }
  get isMovingBack   () { return this._isMovingBack    }
  get isMovingRight  () { return this._isMovingRight   }
  get isMovingUp     () { return this._isMovingUp      }
  get isMovingDown   () { return this._isMovingDown    }

  setForwardMovementState(event)
  {
    this._isMovingForward =  event.detail.state
  }

  setLeftMovementState(event)
  {
    this._isMovingLeft = event.detail.state
  }

  setRightMovementState(event)
  {
    this._isMovingRight = event.detail.state
  }

  setBackMovementState(event)
  {
    this._isMovingBack = event.detail.state
  }

  setUpMovementState(event)
  {
    this._isMovingUp = event.detail.state
  }

  setDownMovementState(event)
  {
    this._isMovingDown = event.detail.state
  }

  setLookDirection(context, camera, mouseEvent)
  {
    if (!this.havePointerLock) return

    // We'll use the mouse coords directly as yaw and pitch,
    // exploiting the small angle approximation: sin(a) = a
    this._yaw   += mouseEvent.movementX/context.canvas.width
    this._pitch -= mouseEvent.movementY/context.canvas.height
    this._pitch  = clip(this._pitch, -1.55334, 1.55334) // +/- 89 degrees

    // View-plane normal
    const n = vec3.normalize([], [
      Math.cos(this._yaw)*Math.cos(this._pitch),
      Math.sin(this._pitch),
      Math.sin(this._yaw)*Math.cos(this._pitch),
    ])
    // right vector
    // const u = vec3.normalize([], vec3.cross([], camera.up, n))
    // up vector
    // const v = vec3.normalize([], vec3.cross([], n, u))

    camera.at  = vec3.add([], camera.eye, n)
  }

  togglePointerLock(context, event)
  {
    if (!document.pointerLockElement)
      context.canvas.requestPointerLock()
  }

  get havePointerLock()
  {
    return document.pointerLockElement && true
  }
}
