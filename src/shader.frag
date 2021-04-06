precision highp float;
precision highp int;

uniform sampler2D uSampler;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uScreen;

varying highp vec2 vTextureCoord;

void main() {

  vec4 wCamera = uModelViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 wPlane =  uProjectionMatrix * uModelViewMatrix * vec4((vTextureCoord.xy - vec2(0.5, 0.5)) * uScreen, 1.0, 1.0);

  vec4 color = vec4(0,0,0,0);
  for (int i=0; i<200; ++i) {
    float step = 2.0 * (1.0-float(i) / 200.0); //(100.0 - float(i)) / 10.0;

    // this should affect the perspective (?) since the checking plane gets curved
    vec4 v = wCamera + (wPlane-wCamera) * step;
    // v.z = v.z * 4.0;
    float scale = 1.0; //0.2*uScreen.x / 8.0;
    float depth = min(1.0, 1.0 - length(v - wCamera) / 200.0);

    if (v.x > 0.0 && v.x < 8.0 && v.y > 0.0 && v.y < 8.0*scale, v.z > 0.0 && v.z < 8.0*scale) {
      int z = int(v.z/(scale*8.0));
      int x = int(v.x/(scale*8.0));
      int y = int(v.y/(scale*8.0));
      int j = z * 64 + y * 8 + x;
      int k = j / 32;
      vec2 uv = vec2(float(j) - float(k) * 32.0, float(k)) / 32.0;

      vec4 cell = texture2D(uSampler, uv);
      float alpha = cell.a * depth; // * (v.z / 8.0);

      if (cell.a > 0.0) {
        color = vec4(cell.rgb, alpha);
      }
    }
    //  else {
    //   // gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    // }
  }
  gl_FragColor = color;
}