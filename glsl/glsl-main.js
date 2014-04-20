(function(window) {

function createProgram(window, gl) {
  var vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, 'attribute vec3 aPos; void main(void) { gl_Position = vec4(aPos, 1.0); }');
  gl.compileShader(vsh);

  var fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, window.fragmentShaderSrc());
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

  var mouse = {
    x: -0.25,
    y: 0.304,
    z: 48.989795,

    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartClientX: 0,
    dragStartClientY: 0
  };

  var onMouseDown = function(e) {
    e.preventDefault();
    mouse.dragging = true;
    mouse.dragStartX = mouse.x;
    mouse.dragStartY = mouse.y;
    mouse.dragStartClientX = e.clientX;
    mouse.dragStartClientY = e.clientY;
  }
  var onMouseUp = function(e) {
    e.preventDefault();
    mouse.dragging = false;
  }
  var onMouseWheel = function(e) {
    e.preventDefault();
    mouse.z -= e.wheelDelta / 10;
    if (mouse.z < 10) {
      mouse.z = 10;
    } else if (mouse.z > 100) {
      mouse.z = 100;
    }
  }
  var onMouseMove = function(e) {
    if (!mouse.dragging) {
      return;
    }
    e.preventDefault();

    mouse.x = mouse.dragStartX - (e.clientX - mouse.dragStartClientX) / 200;
    mouse.y = mouse.dragStartY + (e.clientY - mouse.dragStartClientY) / 200;

    while (mouse.x < -1.0) {
      mouse.x += 2.0;
    }
    while (mouse.x > 1.0) {
      mouse.x -= 2.0;
    }

    if (mouse.y < 0.0) {
      mouse.y = 0.0;
    } else if (mouse.y > 0.5) {
      mouse.y = 0.5;
    }
  };
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseout', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousewheel', onMouseWheel);

  canvas.width = 256;
  canvas.height = 212;

  var update = function() {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(attributes.aPos);
    gl.vertexAttribPointer(attributes.aPos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform3f(uniforms.mouse, mouse.x, mouse.y, mouse.z);

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
