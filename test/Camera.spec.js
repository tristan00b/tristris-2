import { Camera } from '../app/scripts/Camera'
import { mat4 } from 'gl-matrix'


describe('Camera', function () {

  const identity = mat4.create()


  //--------------------------------------------------------------------------------------------------------------------
  describe('Camera#lookat', function () {

    const eye = [0, -1,  0]
    const up  = [0,  1,  0]
    const at  = [0,  0,  0]
    const lookat = mat4.lookAt(mat4.create(), eye, at, up)


    it('default constructs an identity matrix', function () {
      const cam = new Camera
      expect( cam.lookat.toString() ).toEqual( identity.toString() )
    })


    it('can generate a lookat matrix', function () {
      const cam = new Camera
      cam.lookat = { eye, at, up }
      expect( cam.lookat.toString() ).toEqual( lookat.toString() )
    })


    it('overwrites a lookat parameter when after already being set', function () {
      const cam = new Camera
      cam.lookat = { eye: [1,2,3] }
      cam.lookat = { eye: [3,2,1] }
      expect( cam._eye.toString() ).toEqual( [3,2,1].toString() )
    })


    it('remembers previously set values when another is modified', function () {
      const cam = new Camera
      cam.lookat = { eye }
      cam.lookat = { at  }
      expect( cam._at.toString() ).toEqual( at.toString() )
    })
  })


  //--------------------------------------------------------------------------------------------------------------------
  describe('Camera#perspective', function () {

    const near   = 0.1
    const far    = 100
    const fovy   = 45 * Math.PI / 180
    const aspect = 16/9
    const perspective = mat4.perspective(mat4.create(), fovy, aspect, near, far)


    it('default constructs a perspective matrix', function () {
      const cam = new Camera
      expect( cam.projection.toString() ).toEqual( identity.toString() )
    })


    it('cat generate a perspective matrix', function () {
      const cam = new Camera
      cam.perspective = { near, far, fovy, aspect }
      expect( cam.projection.toString() ).toEqual( perspective.toString() )
    })

    it('overwrites a perspective parameter when after already being set', function () {
      const cam = new Camera
      cam.perspective = { near: 11 }
      cam.perspective = { near: 22 }
      expect( cam._near.toString() ).toEqual( (22).toString() )
    })

    it('remembers previously set values when another is set', function () {
      const cam = new Camera
      cam.perspective = { near }
      cam.perspective = { far  }
      expect(cam._near).toEqual(near)
    })
  })
})
