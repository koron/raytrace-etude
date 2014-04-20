(function(window) {

function createProgram(window, gl) {
  var vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, 'attribute vec3 aPos; void main(void) { gl_Position = vec4(aPos, 1.0); }');
  gl.compileShader(vsh);

  var fsh = gl.createShader(gl.FRAGMENT_SHADER);
  var shaderSrc = window.document.getElementById('fragmentShaderSrc').textContent;
  gl.shaderSource(fsh, shaderSrc);
  gl.compileShader(fsh);

  var prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);

  gl.deleteShader(vsh);
  gl.deleteShader(fsh);

  return prog;
}

function main() {
  var canvas = window.document.getElementById('c');
  var attrs = { alpha: false, antialias: false };
  var gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
  if (!gl) {
    alert("Your browser doesn't support WebGL");
    return;
  }

  var prog = createProgram(window, gl);

  var uniforms = {
    resolution: gl.getUniformLocation(prog, 'resolution'),
    mouse: gl.getUniformLocation(prog, 'mouse')
  };
  var attributes = {
    aPos: gl.getAttribLocation(prog, 'aPos')
  }

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0
      ]),
      gl.STATIC_DRAW);
  var startTime = new Date();
  var mouse = { x: 0.0, y: 0.0 };

  var onMouseMove = function(e) {
    mouse.x = (e.pageX - e.currentTarget.offsetLeft) / e.currentTarget.width;
    mouse.y = 1.0 - (e.pageY - e.currentTarget.offsetTop) / e.currentTarget.height;
  };
  canvas.addEventListener('mousemove', onMouseMove);

  canvas.width = 256;
  canvas.height = 212;

  var update = function() {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(attributes.aPos);
    gl.vertexAttribPointer(attributes.aPos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(update);
  }
  update();
}

window.addEventListener('load', main);

})(window);
