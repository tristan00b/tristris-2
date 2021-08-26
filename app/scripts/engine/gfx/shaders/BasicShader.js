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

                  uniform mat4 model_matrix;
                  uniform mat4 view_matrix;
                  uniform mat4 projection_matrix;

                  uniform struct Light {
                    vec3 position;
                    vec3 colour;
                  } light;

                  in vec3 vertex_position;
                  in vec3 vertex_normal;

                  out vec3 pass_vertex_position;
                  out vec3 pass_vertex_normal;
                  out vec3 pass_light_position;
                  out vec3 pass_light_colour;

                  void main() {
                    pass_light_position   = (view_matrix * vec4(light.position, 1.0)).xyz;
                    pass_light_colour     = light.colour;

                    mat4 modelView        = view_matrix * model_matrix;
                    pass_vertex_position  = (modelView * vec4(vertex_position, 1.0)).xyz;
                    pass_vertex_normal    = (modelView * vec4(vertex_normal, 1.0)).xyz;

                    gl_Position = projection_matrix * vec4(pass_vertex_position, 1.0);
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

                  in vec3 pass_vertex_position;
                  in vec3 pass_vertex_normal;
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
                    vec3 diffuse  = kd * pass_light_colour * material.diffuse;
                    vec3 specular = ks * pass_light_colour * material.specular;

                    out_colour = vec4(diffuse + specular + ambient, 1.0);
                  }`
      })
  }
}
