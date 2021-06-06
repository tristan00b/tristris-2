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

                  in vec4 vertex_position;
                  in vec4 vertex_normal;

                  out vec4 pass_position;
                  out vec4 pass_normal;
                  out vec4 pass_light_pos;
                  out vec4 pass_light_col;

                  void main() {
                    mat4 modelView = view_matrix * model_matrix;

                    pass_light_pos = modelView * vec4(light.position, 1.0);
                    pass_light_col = vec4(light.colour, 1.0);

                    pass_position  = modelView * vertex_position;
                    pass_normal    = modelView * vertex_normal;
                    gl_Position    = projection_matrix * pass_position;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  uniform struct Material {
                    vec4  ambient;
                    vec4  diffuse;
                    vec4  specular;
                    float shininess;
                  } material;

                  in vec4 pass_position;
                  in vec4 pass_normal;
                  in vec4 pass_light_pos;
                  in vec4 pass_light_col;

                  out vec4 out_color;

                  void main() {
                    vec4  material_ambient   = vec4(0.0f, 0.f, 0.4f, 1.f);
                    vec4  material_diffuse   = normalize(gl_FragCoord);
                    vec4  material_specular  = vec4(1.f, 0.f, 1.f, 1.f);
                    float material_shininess = 100.0f;

                    vec4  N  = normalize(pass_normal);
                    vec4  L  = normalize(pass_light_pos - pass_position);
                    vec4  V  = normalize(-pass_position);
                    vec4  H  = normalize(L + V);
                    vec4  R  = reflect(L, N);
                    float kd = max(dot(N, L), 0.f);
                    float ks = pow(max(dot(R, V), 0.0), material.shininess);

                    vec4 ambient  =      pass_light_col * material.ambient;
                    vec4 diffuse  = kd * pass_light_col * material.diffuse;
                    vec4 specular = ks * pass_light_col * material.specular;

                    out_color = diffuse + specular + ambient;
                  }`
      })
  }
}
