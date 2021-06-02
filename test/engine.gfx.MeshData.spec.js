import { MeshData, VertexAttributeType } from '../app/scripts/engine/gfx/MeshData'
import * as gl from '../app/scripts/engine/gfx/WebGL/constants'


describe('MeshData', function () {

  describe('MeshData()', function () {

    it('can be instantiated', function () {

      const args = {
        vertices: [1,2,3,4],
        indices:  [0,1,2,2,3,0],
        primtype: gl.TRIANGLES,
        attrib:   { type: VertexAttributeType.POSITION, size: 3, format: gl.FLOAT },
      }

      expect(_ => new MeshData(args)).not.toThrow()
    })

    it('will throw if vertices not provided', function () {

      const args = {
        indices:  [0,1,2,2,3,0],
        primtype: gl.TRIANGLES,
        attrib:   { type: VertexAttributeType.POSITION, size: 3, format: gl.FLOAT },
      }

      expect(_ => new MeshData(args)).toThrow(/requires vertex data/)
    })

    it('will not throw if indices are not provided', function () {

      const args = {
        vertices: [1,2,3,4],
        indices:  [0,1,2,2,3,0],
        primtype: gl.TRIANGLES,
        attrib:   { type: VertexAttributeType.POSITION, size: 3, format: gl.FLOAT },
      }

      expect(_ => new MeshData(args)).not.toThrow()
    })

    it('will throw if attribute data is missing or malformed', function () {

      const args = {
        vertices: [1,2,3,4],
        indices:  [0,1,2,2,3,0],
        primtype: gl.TRIANGLES,
      }

      args.attrib = { size: 4 }
      expect(_ => new MeshData(args)).toThrow(/attributes require a type/)

      args.attrib = { type: 0 }
      expect(_ => new MeshData(args)).toThrow(/attributes require a size/)

      args.attrib = { type: -20, size: 4}
      expect(_ => new MeshData(args)).toThrow(/invalid attribute type/)

      args.attrib = { type: 200, size: 4}
      expect(_ => new MeshData(args)).toThrow(/invalid attribute type/)

      args.attrib = { type: 0, size: -20 }
      expect(_ => new MeshData(args)).toThrow(/attribute size limited to between 1 and 4/)

      args.attrib = { type: 0, size: 200 }
      expect(_ => new MeshData(args)).toThrow(/attribute size limited to between 1 and 4/)
    })

  })

})
