export const shaders = {

vsource: `#version 300 es
in vec4 vertex_position;

uniform vec4 screen_resolution;
uniform mat4 model_view_matrix;
uniform mat4 projection_matrix;

void main() {

  gl_Position = projection_matrix * model_view_matrix * (vertex_position / screen_resolution);
}

`,

fsource: `#version 300 es
precision highp float;

out vec4 out_color;

void main() {
  out_color = vec4(1.0, 1.0, 1.0, 1.0);
}

`}
