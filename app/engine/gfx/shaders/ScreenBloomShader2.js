import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class ScreenBloomShader2 extends ShaderProgram
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
                    pass_vertex_uvcoord = in_vertex_uvcoord;
                    gl_Position = vec4(in_vertex_position, 1.0);
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  uniform bool horizontal;
                  uniform sampler2D scene;
                  uniform sampler2D bloom;

                  in vec2 pass_vertex_uvcoord;
                  out vec4 out_colour;

                  const float gamma    = 2.2;
                  const float exposure = 1.0;

                  void main()
                  {
                    vec3 scnval = texture(scene, pass_vertex_uvcoord).rgb;
                    vec3 blmval = texture(bloom, pass_vertex_uvcoord).rgb * 0.01;
                    vec3 hdrval = vec3(1.0) - exp(-(scnval + blmval) * exposure);

                    out_colour  = vec4(pow(hdrval, vec3(1.0/gamma)), 1.0);
                  }`
      })
  }
}
