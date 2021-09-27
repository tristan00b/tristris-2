import { MeshData, VertexAttributeType } from '../app/engine/gfx/MeshData'
import * as gl from '../app/engine/gfx/WebGL/constants'


describe('MeshData', function () {

  describe('MeshData.constructor', function () {

    it('can be instantiated', function () {

      const data = {
        attributes: [
          {
            type: VertexAttributeType.POSITIONS,
            size: 3,
            format: gl.FLOAT,
            data: [1,2,3,4,5,6],
          },
          {
            type: VertexAttributeType.NORMALS,
            size: 3,
            format: gl.FLOAT,
            data: [1,2,3,4,5,6],
          },
          // ...
        ]
      }

      expect(_ => new MeshData(data)).not.toThrow()
    })

    it('will throw if attribute type is not provided', function () {

      const data = {
        attributes: [{
          size: 3,
          format: gl.FLOAT,
          data: [0,1,2]
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attributes require a type property/)
    })


    it('will throw if attribute size is not provided', function () {

      const data = {
        attributes: [{
          type: VertexAttributeType.POSITIONS,
          format: gl.FLOAT,
          data: [0,1,2]
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attributes require a size property/)
    })

    it('will throw if attribute data is not provided', function () {

      const data = {
        attributes: [{
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attributes require a data property to be defined/)
    })

    it('will throw if attribute type is invalid', () => {
      const data = {
        attributes: [{
          type: 'nonsense',
          size: 3,
          format: gl.FLOAT,
          data: [0,1,2]
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attribute type must be a type specified by VertexAttributeType/)
    })

    it('will throw if attribute size is invalid', function () {

      const data = {
        attributes: [{
          type: VertexAttributeType.POSITIONS,
          size: 5,
          data: [0,1,2]
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attribute size must be between 1 and 4 components/)
    })

    it('will throw if attribute data is empty', function () {

      const data = {
        attributes: [{
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: gl.FLOAT,
          data: []
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attribute data must be a non-empty array/)
    })

    it('will throw if attribute data is not a multiple of size', function () {

      const data = {
        attributes: [{
          type: VertexAttributeType.POSITIONS,
          size: 4,
          format: gl.FLOAT,
          data: [0,1,2]
        }]
      }

      expect(_ => new MeshData(data)).toThrow(/attribute data must contain a multiple of size elements/)
    })
  })
})
