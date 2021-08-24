/*
 * name:     Plane
 * vertices:     4
 * normals:      4
 * uvcoords:     4
 * indices:      6
 */
export const model = {
  name:       "Plane",
  material:   "Plane",
  positions:  [10, 0, 10, -10, 0, -10, -10, 0, 10, 10, 0, -10],
  normals:    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  colours:    [],
  uvcoords:   [0.0001, 0.9999, 0.9999, 0.0001, 0.9999, 0.9999, 0.0001, 0.0001],
  indices:    [0, 1, 2, 0, 3, 1],
  components: 3
}
