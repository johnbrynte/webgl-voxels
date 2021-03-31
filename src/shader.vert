attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main() {
  //gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}