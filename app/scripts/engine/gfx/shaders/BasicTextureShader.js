import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class BasicTextureShader extends ShaderProgram
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
                  in  vec2 in_vertex_uvcoord;
                  out vec3 pass_vertex_position;
                  out vec3 pass_vertex_normal;
                  out vec2 pass_vertex_uvcoord;

                  void main()
                  {
                    mat4 modelView = m.view * model_matrix;
                    vec4 position = modelView * vec4(in_vertex_position, 1.0);
                    vec4 normal   = modelView * vec4(in_vertex_normal,   0.0);

                    pass_vertex_position = vec3(position);
                    pass_vertex_normal   = vec3(normal);
                    pass_vertex_uvcoord  = in_vertex_uvcoord;

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

                  uniform struct Material {
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

                  uniform Material  material;
                  uniform sampler2D sampler;

                  in vec3 pass_vertex_position;
                  in vec3 pass_vertex_normal;
                  in vec2 pass_vertex_uvcoord;

                  out vec4 out_colour;

                  void main()
                  {
                    out_colour = vec4(0.0);

                    vec3 V  = normalize(-pass_vertex_position);
                    vec3 N  = normalize(pass_vertex_normal);
                    vec2 UV = pass_vertex_uvcoord;

                    for (int i=0; i<LIGHT_COUNT; i++)
                    {
                      vec3 light_pos = vec3(m.view * vec4(lights[i].position, 1.0));

                      vec3 L = normalize(light_pos - pass_vertex_position);
                      vec3 H = normalize(L + V);

                      float kd = max(dot(N, L), 0.0);
                      float ks = pow(max(dot(N, H), 0.0), material.shininess);

                      vec3 ambient  =       lights[i].colour * material.ambient;
                      vec3 diffuse  = kd  * lights[i].colour * texture(sampler, UV).xyz;
                      vec3 specular = ks  * lights[i].colour * material.specular;

                      out_colour += vec4(ambient + diffuse + specular, 1.0);
                    }
                  }`
      })
  }
}
