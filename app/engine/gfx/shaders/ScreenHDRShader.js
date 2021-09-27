import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class ScreenHDRShader extends ShaderProgram
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
                  uniform float gamma;
                  uniform float exposure;

                  in  vec2 pass_vertex_uvcoord;
                  out vec4 out_colour;

                  void main()
                  {
                    vec4 texel = texture(sampler, pass_vertex_uvcoord);

                    vec4 hdrval = vec4(1.0) - exp(-texel * exposure);
                    hdrval = pow(hdrval, vec4(1.0 / gamma));

                    out_colour = vec4(hdrval.xyz, 1.0);
                  }`
      })
  }
}
