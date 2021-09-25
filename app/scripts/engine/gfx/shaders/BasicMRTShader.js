import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class BasicMRTShader extends ShaderProgram
{
  constructor(gl, lightCount)
  {
    lightCount ??= 1

    super(gl,
      {
        type:     gl.VERTEX_SHADER,
        source:  `#version 300 es

                  layout (std140) uniform Matrix {
                    mat4 view;
                    mat4 projection;
                  } m;

                  uniform mat4 model_matrix;

                  in  vec3 in_vertex_position;
                  in  vec3 in_vertex_normal;
                  out vec3 pass_vertex_position;
                  out vec3 pass_vertex_normal;

                  void main()
                  {
                    mat4 modelView = m.view * model_matrix;
                    vec4 position = modelView * vec4(in_vertex_position, 1.0);
                    vec4 normal   = modelView * vec4(in_vertex_normal,   0.0);

                    pass_vertex_position = vec3(position);
                    pass_vertex_normal   = vec3(normal);

                    gl_Position = m.projection * position;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  #define LIGHT_COUNT ${lightCount}

                  struct Light {
                    vec3 position;
                    vec3 colour;
                  };

                  struct Material {
                    vec3  ambient;
                    vec3  diffuse;
                    vec3  specular;
                    float shininess;
                  };

                  layout (std140) uniform Matrix {
                    mat4 view;
                    mat4 projection;
                  } m;

                  layout (std140) uniform LightSources {
                    Light lights[LIGHT_COUNT];
                  };

                  uniform Material material;

                  in  vec3 pass_vertex_position;
                  in  vec3 pass_vertex_normal;

                  out vec4 out_colour[2];

                  void main()
                  {
                    vec3 colour = vec3(0.0);

                    vec3 V = normalize(-pass_vertex_position);
                    vec3 N = normalize(pass_vertex_normal);

                    for (int i=0; i<LIGHT_COUNT; i++)
                    {
                      vec3 light_pos = vec3(m.view * vec4(lights[i].position, 1.0));

                      vec3 L = normalize(light_pos - pass_vertex_position);
                      vec3 H = normalize(L + V);

                      float d = length(L);
                      float attenuation = 1.0/(1.0 + 0.1*d + 0.01*d*d);

                      float kd = max(dot(N, L), 0.0);
                      float ks = pow(max(dot(N, H), 0.0), material.shininess);

                      vec3 ambient  =       lights[i].colour * material.ambient  * attenuation;
                      vec3 diffuse  = kd  * lights[i].colour * material.diffuse  * attenuation;
                      vec3 specular = ks  * lights[i].colour * material.specular * attenuation;

                      colour += ambient + diffuse + specular;
                    }

                    out_colour[0] = vec4(colour, 1.0);

                    float brightness = dot(colour, vec3(0.2126, 0.7152, 0.0722));
                    if (brightness > 1.0)
                    {
                      out_colour[1] = vec4(colour, 1.0);
                    }
                    else
                    {
                      out_colour[1] = vec4(0.0, 0.0, 0.0, 1.0);
                    }
                  }`
      })
  }
}
