export const shaders = {

vsource: `
attribute vec4 vertex_position;

void main() {
  gl_Position = vertex_position;
}
`,

fsource: `
precision highp float;

void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`
}
