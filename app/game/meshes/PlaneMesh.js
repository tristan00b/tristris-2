/*
 * name:     Plane
 * vertices:     4
 * normals:      4
 * uvcoords:     4
 * colours:      0
 * indices:      6
 */
export const model = {
  name:       "Plane",
  material:   "Plane",
  positions:  [-10.000003, 0, -9.999997, 10.000003, 0, 9.999997, 9.999997, 0, -10.000003, -9.999997, 0, 10.000003],
  normals:    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  uvcoords:   [0.0001, -0.9999, 0.9999, -0.0001, 0.9999, -0.9999, 0.0001, -0.0001],
  colours:    [],
  indices:    [0, 1, 2, 0, 3, 1],
}
