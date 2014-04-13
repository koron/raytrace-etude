(function(window, RayTracer) {

var scene2 = {
  camera: [20, 40, 20],
  target: [0, 0, 0],
  light: [-8, 9, -3],
  zoom: 6,
  items: [
    {
      position: [2, 0, 2],
      size: [.2, .2, .2],
      type: 1,
      shadingNumber: 2
    },
    {
      position: [-2, 2, 2],
      size: [.2, .2, .2],
      type: 1,
      shadingNumber: 3
    },
    {
      position: [-6, 4, 2],
      size: [.2, .2, .2],
      type: 1,
      shadingNumber: 4
    },
    {
      position: [-2, 2, -2],
      size: [.2, .2, .2],
      type: 1,
      shadingNumber: 5
    },
    {
      position: [-6, 4, -6],
      size: [.2, .2, .2],
      type: 1,
      shadingNumber: 6
    },
    {
      position: [0, -2, 0],
      size: [20, 1, 20],
      type: 0,
      shadingNumber: -1
    }
  ],
  shadings: [
    {
      color:    [.9, .9, .9],
      ambient:  .5,
      diffuse:  .4,
      mirror:   .6,
      surface:  .7,
      specular:  6
    },
    {
      color:    [.0, .9, .0],
      ambient:  .5,
      diffuse:  .4,
      mirror:   .6,
      surface:  .7,
      specular:  6
    },
    {
      color:    [.9, .0, .0],
      ambient:  .3,
      diffuse:  .6,
      mirror:   .0,
      surface:  .0,
      specular:  0
    },
    {
      color:    [.9, .9, .9],
      ambient:  .3,
      diffuse:  .6,
      mirror:   .0,
      surface:  .6,
      specular:  8
    },
    {
      color:    [.0, .0, .9],
      ambient:  .3,
      diffuse:  .6,
      mirror:   .0,
      surface:  .6,
      specular:  8
    },
    {
      color:    [.9, .9, .9],
      ambient:  .3,
      diffuse:  .6,
      mirror:   .0,
      surface:  .6,
      specular:  6
    },
    {
      color:    [.0, .0, .0],
      ambient:  .3,
      diffuse:  .6,
      mirror:   .1,
      surface:  .9,
      specular:  8
    },
  ]
};

function main() {
  var c = window.document.getElementById('c');
  var rt = new RayTracer(c, 256, 212, scene2);
  rt.render();
}

window.addEventListener('load', main);

})(this, this.RayTracer);
