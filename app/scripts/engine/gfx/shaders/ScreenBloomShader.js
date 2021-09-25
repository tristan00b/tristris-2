import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class ScreenBloomShader extends ShaderProgram
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

                  const int FRAG_COUNT = 5;

                  uniform sampler2D image;
                  uniform bool horizontal;
                  const float weight[5] = float[] (0.2270270270, 0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162);

                  in vec2 pass_vertex_uvcoord;
                  out vec4 out_colour;

                  void main()
                  {
                    vec2 offset  = 1.0 / vec2(textureSize(image, 0));
                    vec3 colour  = texture(image, pass_vertex_uvcoord).rgb * weight[0];

                    if (horizontal)
                    {
                      for (int i=0; i<FRAG_COUNT; ++i)
                      {
                        colour += texture(image, pass_vertex_uvcoord + vec2(offset.x * float(i), 0.0)).rgb * weight[i];
                        colour += texture(image, pass_vertex_uvcoord - vec2(offset.x * float(i), 0.0)).rgb * weight[i];
                      }
                    }
                    else
                    {
                      for (int i=0; i<FRAG_COUNT; ++i)
                      {
                        colour += texture(image, pass_vertex_uvcoord + vec2(0.0, offset.y * float(i))).rgb * weight[i];
                        colour += texture(image, pass_vertex_uvcoord - vec2(0.0, offset.y * float(i))).rgb * weight[i];
                      }
                    }

                    out_colour = vec4(colour, 1.0);
                  }`
      })
  }
}
