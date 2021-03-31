import { mat4, vec4 } from "gl-matrix";

import vertexSource from "./shader.vert";
import fragmentSource from "./shader.frag";

var canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;
var gl = canvas.getContext("webgl");

// shadesr

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentSource);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

var aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
var aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");

var uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
var uProjectionMatrix = gl.getUniformLocation(
  shaderProgram,
  "uProjectionMatrix"
);
var uScreen = gl.getUniformLocation(shaderProgram, "uScreen");
var uSampler = gl.getUniformLocation(shaderProgram, "uSampler");

// buffers

var positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var positions = [-1, 1, 1, 1, -1, -1, 1, -1];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const textureCoordBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

const textureCoordinates = [0, 0, 1, 0, 0, 1, 1, 1];

gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(textureCoordinates),
  gl.STATIC_DRAW
);

// texture

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

const bitmap = [
  0, 0, 0, 1, 1, 0, 0, 0,
  0, 0, 1, 0, 0, 1, 0, 0,
  0, 1, 0, 0, 0, 0, 1, 0,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  0, 1, 0, 0, 0, 0, 1, 0,
  0, 0, 1, 0, 0, 1, 0, 0,
  0, 0, 0, 1, 1, 0, 0, 0
];

const imageDataSize = 32 * 32 * 4;
const imageDataRaw = new Array(imageDataSize);
for (var i = 0; i < imageDataSize; i += 4) {
  var j = i / 4;
  imageDataRaw[i] = Math.floor(Math.random() * 255);
  imageDataRaw[i + 1] = Math.floor(Math.random() * 255);
  imageDataRaw[i + 2] = Math.floor(Math.random() * 255);
  // imageDataRaw[i + 3] = j < bitmap.length ? 255 * bitmap[j] : 0;
  imageDataRaw[i + 3] = 255; //Math.random() > 0.87 ? 255 : 0;
}
const imageData = new Uint8Array(imageDataRaw);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
// gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// render

var cameraTranslate = [0, 0, -8];

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

  // matrix

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1.0;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    cameraTranslate
  ); // amount to translate
  // mat4.rotateY(
  //   modelViewMatrix,
  //   modelViewMatrix,
  //   Math.PI / 8
  // );

  mat4.invert(projectionMatrix, projectionMatrix);
  mat4.invert(modelViewMatrix, modelViewMatrix);

  // buffers

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTextureCoord);

  gl.useProgram(shaderProgram);

  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  gl.uniform2fv(uScreen, [600, 600]);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uSampler, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

window.addEventListener("keydown", function(e) {
  if (e.code === "KeyA") {
    cameraTranslate[0] -= 1;
  }
  if (e.code === "KeyD") {
    cameraTranslate[0] += 1;
  }
  if (e.code === "KeyW") {
    cameraTranslate[1] += 1;
  }
  if (e.code === "KeyS") {
    cameraTranslate[1] -= 1;
  }
  if (e.code === "KeyQ") {
    cameraTranslate[2] += 1;
  }
  if (e.code === "KeyE") {
    cameraTranslate[2] -= 1;
  }
  console.log(cameraTranslate);
  render();
})

render();