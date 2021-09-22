import { MeshData,
         VertexAttributeType } from '../MeshData'
import { FLOAT,
         TRIANGLE_STRIP,          } from '../WebGL/constants'


export function quad(x, y, w, h)
{
    return new MeshData({
      primtype: TRIANGLE_STRIP,
      attributes: [
        {
          type: VertexAttributeType.POSITIONS,
          size: 3,
          format: FLOAT,
          data: [
            x,   y,   0,
            x+w, y,   0,
            x,   y+h, 0,
            x+w, y+h, 0,
          ],
          // [x, y, x2, y, x, y2, x2, y2]
        },
        {
          type: VertexAttributeType.NORMALS,
          size: 3,
          format: FLOAT,
          data: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
          ],
        },
        {
          type: VertexAttributeType.UVCOORDS,
          size: 2,
          format: FLOAT,
          data: [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
          ],
        },
      ],
    })
}
