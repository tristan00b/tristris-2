import { quat } from 'gl-matrix'

export class PlayerController
{
  constructor()
  {
    this._isMovingForward = false
    this._isMovingLeft    = false
    this._isMovingBack    = false
    this._isMovingRight   = false

    this._rotation = quat.create()

    window.addEventListener('player/fwd', e => this.setForwardMovementState(e.detail))
  }

  get isMovingForward()
  {
    // return this._isMovingForward
  }
  setForwardMovementState(state)
  {
    console.log(`player is moving forward: ${state}`)
  }
}
