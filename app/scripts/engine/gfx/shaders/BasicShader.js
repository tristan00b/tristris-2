import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class BasicShader extends ShaderProgram
{
  constructor(gl)
  {
    super(gl,
      {
        type:     gl.VERTEX_SHADER,
        source:  `#version 300 es
                  in vec4 vertex_position;

                  uniform mat4 model_matrix;
                  uniform mat4 view_matrix;
                  uniform mat4 projection_matrix;

                  void main() {
                    gl_Position = projection_matrix * view_matrix * model_matrix * vertex_position;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  out vec4 out_color;

                  void main() {
                    out_color = vec4(1.0, 1.0, 1.0, 1.0);
                  }`
      })
  }
}
