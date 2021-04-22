import { Matrix } from '../app/scripts/Matrix'

describe('Matrix', function() {

  describe('Matrix(0, 2)', function() {

    const m = new Matrix(0, 2)

    it('should return a matrix width two rows', function() {
      expect(m.length).toBe(2)
    })

    it('should have 2x2 elements', function () {
      expect(m.flat().length).toBe(4)
    })

    it('should contain only zeros', function (){
      expect(m.flat().every(x => x === 0))
    })

  })
})
