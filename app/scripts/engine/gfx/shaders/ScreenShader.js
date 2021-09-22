import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class ScreenShader extends ShaderProgram
{
  constructor(gl)
  {
    super(gl,
      {
        type:     gl.VERTEX_SHADER,
        source:  `#version 300 es

                  in  vec3 in_vertex_position;
                  in  vec2 in_vertex_uvcoord;
                  out vec2 pass_vertex_uvcoord;

                  void main()
                  {
                    gl_Position = vec4(in_vertex_position.x, in_vertex_position.y, 0.0, 1.0);
                    pass_vertex_uvcoord = in_vertex_uvcoord;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  uniform sampler2D sampler;

                  in  vec2 pass_vertex_uvcoord;
                  out vec4 out_colour;

                  void main()
                  {
                    vec4 c = texture(sampler, pass_vertex_uvcoord);

                    // if ( c == vec4(vec3(0.0), 1.0) )
                    // {
                    //   out_colour = vec4(1.0, 0.0, 0.0, 1.0);
                    // }
                    // else
                    // {
                      out_colour = texture(sampler, pass_vertex_uvcoord);
                    // }

                  }`
      })
  }
}
