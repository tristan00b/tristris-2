import { Game } from '../app/scripts/Game'
import canvas from './mock/canvas.mock'

describe('Game', function () {

  describe('Game(...)', function () {

    it('throws if any required arguments are nullish', function () {

      const config = {}

      expect(_ => new Game({ config })).toThrow()
      expect(_ => new Game({ canvas })).toThrow()
      expect(_ => new Game({ config, canvas })).not.toThrow()

    })
  })
})
