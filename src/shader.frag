precision highp float;
precision highp int;

uniform sampler2D uSampler;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uScreen;

varying highp vec2 vTextureCoord;

void main() {

  vec4 wCamera = uModelViewMatrix * vec4(0.0,0.0,0.0,1.0);
  vec4 wPlane = uModelViewMatrix * uProjectionMatrix * vec4(vTextureCoord.xy * uScreen, 1.0, 1.0);

  for (int i=0; i<100; ++i) {
    float step = (100.0 - float(i)) / 10.0;

    // this should affect the perspective (?) since the checking plane gets curved
    vec4 v = step * (wCamera + wPlane);

    if (v.x > 0.0 && v.x < 8.0 && v.y > 0.0 && v.y < 8.0, v.z > 0.0 && v.z < 8.0) {
      int x = int(v.x);
      int y = int(v.y);
      int z = int(v.z);
      int i = z * 64 + y * 8 + x;
      int j = i / 32;
      vec2 uv = vec2(float(i) - float(j) * 32.0, float(j)) / 32.0;

      gl_FragColor = texture2D(uSampler, uv);
    } else {
      gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }
  }
}