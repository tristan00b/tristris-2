import { Camera } from '../app/scripts/engine/gfx/Camera'
import { mat4 } from 'gl-matrix'


describe('Camera', function () {

  const identity = mat4.create()

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
      cam.setLookat({ eye, at, up })
      expect( cam.lookat.toString() ).toEqual( lookat.toString() )
    })


    it('overwrites a lookat parameter when after already being set', function () {
      const cam = new Camera
      cam.setLookat({ eye: [1,2,3] })
      cam.setLookat({ eye: [3,2,1] })
      expect( cam._eye.toString() ).toEqual( [3,2,1].toString() )
    })


    it('remembers previously set values when another is modified', function () {
      const cam = new Camera
      cam.setLookat({ eye })
      cam.setLookat({ at  })
      expect( cam._at.toString() ).toEqual( at.toString() )
    })
  })


  describe('Camera.perspective', function () {

    const near   = 0.1
    const far    = 100
    const fovy   = Math.PI / 4
    const aspect = 1.5
    const perspective = mat4.perspective(mat4.create(), fovy, aspect, near, far)


    it('default constructs a perspective matrix', function () {
      const cam = new Camera
      expect( cam.projection.toString() ).toEqual( perspective.toString() )
    })


    it('cat generate a perspective matrix', function () {
      const cam = new Camera
      cam.setPerspective({ near, far, fovy, aspect })
      expect( cam.projection.toString() ).toEqual( perspective.toString() )
    })

    it('overwrites a perspective parameter when after already being set', function () {
      const cam = new Camera
      cam.setPerspective({ near: 11 })
      cam.setPerspective({ near: 22 })
      expect( cam._near.toString() ).toEqual( (22).toString() )
    })

    it('remembers previously set values when another is set', function () {
      const cam = new Camera
      cam.setPerspective({ near })
      cam.setPerspective({ far  })
      expect(cam._near).toEqual(near)
    })
  })
})
