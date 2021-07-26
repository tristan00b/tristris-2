import { Camera } from '../app/scripts/engine/gfx/Camera'
import { mat4,
         vec3   } from 'gl-matrix'


describe('Camera', () => {

  const identity = mat4.create()

  describe('Camera.lookat', () => {

    const eye = [0, -1,  0]
    const up  = [0,  1,  0]
    const at  = [0,  0,  0]
    const lookat = mat4.lookAt(mat4.create(), eye, at, up)

    it('can generate a lookat matrix', () => {
      const cam = new Camera
      cam.setLookat({ eye, at, up })
      expect(mat4.equals(cam.lookat, lookat)).toBe(true)
    })

    it('overwrites a lookat parameter when after already being set', () => {
      const cam = new Camera
      cam.setLookat({ eye: [1,2,3] })
      cam.setLookat({ eye: [3,2,1] })
      expect(vec3.equals(cam.eye, [3,2,1])).toBe(true)
    })

    it('remembers previously set values when another is modified', () => {
      const cam = new Camera
      cam.setLookat({ eye })
      cam.setLookat({ at  })
      expect(vec3.equals(cam.at, at)).toBe(true)
    })
  })


  describe('Camera.perspective', () => {

    const near   = 0.1
    const far    = 100
    const fovy   = Math.PI / 2
    const aspect = 1.5
    const perspective = mat4.perspective(mat4.create(), fovy, aspect, near, far)

    it('cat generate a perspective matrix', () => {
      const cam = new Camera
      cam.setPerspective({ near, far, fovy, aspect })
      expect(mat4.equals(cam.perspective, perspective)).toBe(true)
    })

    it('overwrites a perspective parameter when after already being set', () => {
      const cam = new Camera
      cam.setPerspective({ near: 11 })
      cam.setPerspective({ near: 22 })
      expect(cam.near).toBe(22)
    })

    it('remembers previously set values when another is set', () => {
      const cam = new Camera
      cam.setPerspective({ near })
      cam.setPerspective({ far  })
      expect(cam.near).toBe(near)
    })
  })
})
