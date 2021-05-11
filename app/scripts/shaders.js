export const shaders = {

vsource: `#version 300 es
in vec4 vertex_position;

uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

void main() {
  gl_Position = projection_matrix * view_matrix * model_matrix * vertex_position;
}

`,

fsource: `#version 300 es
precision highp float;

out vec4 out_color;

void main() {
  out_color = vec4(1.0, 1.0, 1.0, 1.0);
}

`}
