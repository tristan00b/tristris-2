import { ShaderProgram } from '../ShaderProgram'

/**
 * @param {external:WebGL2RenderingContext} gl WebGL2 rendering context
 * @extends ShaderProgram
 * @todo improve documentation
 */
export class BasicTextureShader extends ShaderProgram
{
  constructor(gl)
  {
    super(gl,
      {
        type:     gl.VERTEX_SHADER,
        source:  `#version 300 es

                  layout (std140) uniform Light {
                    vec3 position;
                    vec3 colour;
                  } l;

                  layout (std140) uniform Matrix {
                    mat4 view;
                    mat4 projection;
                  } m;

                  uniform mat4 model_matrix;

                  in vec3 vertex_position;
                  in vec3 vertex_normal;
                  in vec2 vertex_uvcoord;

                  out vec3 pass_vertex_position;
                  out vec3 pass_vertex_normal;
                  out vec2 pass_vertex_uvcoord;

                  out vec3 pass_light_position;
                  out vec3 pass_light_colour;

                  void main() {
                    pass_light_position   = (m.view * vec4(l.position, 1.0)).xyz;
                    pass_light_colour     = l.colour;

                    mat4 modelView        = m.view * model_matrix;
                    pass_vertex_position  = (modelView * vec4(vertex_position, 1.0)).xyz;
                    pass_vertex_normal    = (modelView * vec4(vertex_normal, 1.0)).xyz;
                    pass_vertex_uvcoord   = vertex_uvcoord;

                    gl_Position = m.projection * vec4(pass_vertex_position, 1.0);
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  uniform struct Material {
                    vec3  ambient;
                    vec3  diffuse;
                    vec3  specular;
                    float shininess;
                  } material;

                  uniform sampler2D sampler;

                  in vec3 pass_vertex_position;
                  in vec3 pass_vertex_normal;
                  in vec2 pass_vertex_uvcoord;

                  in vec3 pass_light_position;
                  in vec3 pass_light_colour;

                  out vec4 out_colour;

                  void main() {
                    vec3  N  = normalize(pass_vertex_normal);
                    vec3  L  = normalize(pass_light_position - pass_vertex_position);
                    vec3  V  = normalize(-pass_vertex_position);
                    vec3  H  = normalize(L + V);
                    vec3  R  = reflect(L, N);
                    float kd = max(dot(N, L), 0.f);
                    float ks = pow(max(dot(R, V), 0.0), material.shininess);

                    vec3 ambient  =      pass_light_colour * material.ambient;
                    vec3 diffuse  = kd * pass_light_colour * material.diffuse * texture(sampler, pass_vertex_uvcoord).xyz;
                    vec3 specular = ks * pass_light_colour * material.specular;

                    out_colour = vec4(diffuse + specular + ambient, 1.0);
                  }`
      })
  }
}
