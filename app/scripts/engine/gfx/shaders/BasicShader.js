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
                  in vec4 vertex_normal;

                  uniform mat4 model_matrix;
                  uniform mat4 view_matrix;
                  uniform mat4 projection_matrix;

                  out vec4 pass_position;
                  out vec4 pass_normal;

                  void main() {
                    mat4 transform = projection_matrix * view_matrix * model_matrix;
                    pass_position  = transform * vertex_position;
                    pass_normal    = transform * vertex_normal;
                    gl_Position    = pass_position;
                  }`
      },
      {
        type:     gl.FRAGMENT_SHADER,
        source:  `#version 300 es
                  precision highp float;

                  in vec4 pass_position;
                  in vec4 pass_normal;

                  // uniform struct Material {
                  //   vec4  ambient;
                  //   vec4  diffuse;
                  //   vec4  specular;
                  //   float shininess;
                  // } material;

                  out vec4 out_color;

                  void main() {
                    vec4 light_pos = vec4(0.f, 2.f, -2.f, 1.f);
                    vec4 light_col = vec4(1.f, 1.f, 1.f, 1.f);

                    vec4  material_ambient   = vec4(0.0f, 0.f, 0.4f, 1.f);
                    vec4  material_diffuse   = normalize(gl_FragCoord);
                    vec4  material_specular  = vec4(1.f, 0.f, 1.f, 1.f);
                    float material_shininess = 100.0f;

                    vec4 N = normalize(pass_normal);
                    vec4 L = normalize(light_pos - pass_position);
                    vec4 V = normalize(-pass_position);
                    vec4 H = normalize(L + V);
                    vec4 R = reflect(-L, N);

                    vec4 ambient  = material_ambient;
                    vec4 diffuse  = max(dot(N, L), 1.f) * light_col * material_diffuse;
                    vec4 specular = pow(max(dot(R, V), 0.f), material_shininess) * light_col * material_specular;

                    out_color = diffuse + specular + ambient;
                  }`
      })
  }
}
