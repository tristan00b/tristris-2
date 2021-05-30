import { MeshData, VertexAttributeType } from '../app/scripts/engine/gfx/MeshData'

describe('MeshData', function () {

  describe('MeshData()', function () {

    it('can be instantiated', function () {

      const args = {
        vertices:    [1,2,3,4],
        indices:     [0,1,2,2,3,0],
        interleaved: true,
        attribs: [
          { type: VertexAttributeType.POSITION, size: 3 },
          { type: VertexAttributeType.NORMAL,   size: 3 },
          { type: VertexAttributeType.COLOUR,   size: 3 },
        ]
      }

      expect(_ => new MeshData(args)).not.toThrow()
    })

    it('will throw if vertices not provided', function () {

      const args = {
        indices:     [0,1,2,2,3,0],
        interleaved: true,
        attribs: [
          { type: VertexAttributeType.POSITION, size: 3 },
          { type: VertexAttributeType.NORMAL,   size: 3 },
          { type: VertexAttributeType.COLOUR,   size: 3 },
        ]
      }

      expect(_ => new MeshData(args)).toThrow()
    })

    it('will throw if attributes are not provided (1)', function () {

      const args = {
        vertices:    [1,2,3,4],
        indices:     [0,1,2,2,3,0],
        interleaved: true,
      }

      expect(_ => new MeshData(args)).toThrow(/attributes must be specified/)
    })

    it('will throw if attributes are not provided (2)', function () {

      const args = {
        vertices:    [1,2,3,4],
        indices:     [0,1,2,2,3,0],
        interleaved: true,
        attribs:     [],
      }

      expect(_ => new MeshData(args)).toThrow(/attributes must be specified/)
    })

    it('will throw if attribute data is missing or malformed', function () {

      const args = {
        vertices:    [1,2,3,4],
        indices:     [0,1,2,2,3,0],
        interleaved: true,
      }

      args.attribs = [{ size: 4}]
      expect(_ => new MeshData(args)).toThrow(/attributes require a type/)

      args.attribs = [{ type: VertexAttributeType.POSITION }]
      expect(_ => new MeshData(args)).toThrow(/attributes require a size/)

      args.attribs = [{ type: -1, size: 4}]
      expect(_ => new MeshData(args)).toThrow(/invalid attribute type/)

      args.attribs = [{ type: VertexAttributeType.POSITION, size: 0}]
      expect(_ => new MeshData(args)).toThrow(/attribute size limited to between 1 and 4/)
    })

  })

})
