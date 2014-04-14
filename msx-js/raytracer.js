(function(window) {

////////////////////////////////////////////////////////////////////////////
// class Utilities
//

function to255(v) {
  if (v < 0) {
    return 0;
  } else if (v > 1) {
    return 255;
  } else {
    return Math.round(v * 255);
  }
}

////////////////////////////////////////////////////////////////////////////
// class Vec
//

function Vec() {
  if (arguments.length >= 3) {
    this.x = arguments[0];
    this.y = arguments[1];
    this.z = arguments[2];
  } else if (arguments.length == 1
      && arguments[0].constructor === window.Array)
  {
    this.x = arguments[0][0];
    this.y = arguments[0][1];
    this.z = arguments[0][2];
  } else if (arguments.length == 1
      && arguments[0].constructor === Vec)
  {
    this.x = arguments[0].x;
    this.y = arguments[0].y;
    this.z = arguments[0].z;
  } else {
    this.x = this.y = this.z = 0;
  }
}

Vec.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
}

Vec.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  return this;
}

Vec.prototype.mul = function(v) {
  this.x *= v;
  this.y *= v;
  this.z *= v;
  return this;
}

Vec.prototype.len = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

Vec.prototype.normalize = function() {
  return this.mul(1 / this.len());
}

Vec.prototype.dot = function(v) {
  return this.x * v.x + this.y * v.y + this.z * v.z;
}

////////////////////////////////////////////////////////////////////////////
// class Color
//

function Color() {
  if (arguments.length >= 3) {
    this.red = arguments[0];
    this.green = arguments[1];
    this.blue = arguments[2];
  } else if (arguments.length == 1
      && arguments[0].constructor === window.Array)
  {
    this.red   = arguments[0][0];
    this.green = arguments[0][1];
    this.blue  = arguments[0][2];
  } else if (arguments.length == 1
      && arguments[0].constructor === Color)
  {
    this.red   = arguments[0].red;
    this.green = arguments[0].green;
    this.blue  = arguments[0].blue;
  } else {
    this.red = this.green = this.blue = 0;
  }
}

Color.prototype.r = function() {
  return to255(this.red);
}

Color.prototype.g = function() {
  return to255(this.green);
}

Color.prototype.b = function() {
  return to255(this.blue);
}

Color.prototype.add = function(v) {
  if (v.constructor === Color) {
    this.red += v.red;
    this.green += v.green;
    this.blue += v.blue;
  } else {
    this.red += v;
    this.green += v;
    this.blue += v;
  }
  return this;
}

Color.prototype.mul = function(v) {
  this.red *= v;
  this.green *= v;
  this.blue *= v;
  return this;
}

var Black = new Color();

////////////////////////////////////////////////////////////////////////////
// class Item
//

function Item(src) {
  this.position = new Vec(src.position);
  this.size = new Vec(src.size);
  this.type = src.type;
  this.shadeNum = src.shadingNumber;
}

Item.prototype.getCross = function(from, dir) {
  switch (this.type) {
    case 0:
      return this.getCrossBox(from, dir);
    case 1:
      return this.getCrossSphere(from, dir);
    default:
      return null;
  }
}

Item.prototype.getCrossBox = function(from, dir) {
  var t1, t2, t3;
  var r = new Vec(from).sub(this.position);
  var s = this.size;

  if (dir.x == 0) {
    t1 = Infinity;
  } else if (r.x < 0) {
    t1 = -(r.x + s.x) / dir.x;
  } else {
    t1 = -(r.x - s.x) / dir.x;
  }
  if (dir.y == 0) {
    t2 = Infinity;
  } else if (r.y < 0) {
    t2 = -(r.y + s.y) / dir.y;
  } else {
    t2 = -(r.y - s.y) / dir.y;
  }
  if (dir.z == 0) {
    t3 = Infinity;
  } else if (r.z < 0) {
    t3 = -(r.z + s.z) / dir.z;
  } else {
    t3 = -(r.z - s.z) / dir.z;
  }

  if (Math.abs(r.y + t1 * dir.y) > s.y || Math.abs(r.z + t1 * dir.z) > s.z) {
    t1 = Infinity;
  }
  if (Math.abs(r.z + t2 * dir.z) > s.z || Math.abs(r.x + t2 * dir.x) > s.x) {
    t2 = Infinity;
  }
  if (Math.abs(r.x + t3 * dir.x) > s.x || Math.abs(r.y + t3 * dir.y) > s.y) {
    t3 = Infinity;
  }

  if (t1 <= t2 && t1 <= t3) {
    return {
      distance: t1,
      normal: new Vec(-dir.x  / Math.abs(dir.x), 0, 0)
    };
  } else if (t2 <= t3 && t2 <= t1) {
    return {
      distance: t2,
      normal: new Vec(0, -dir.y  / Math.abs(dir.y), 0)
    };
  } else if (t2 <= t3 && t2 <= t1) {
    return {
      distance: t3,
      normal: new Vec(0, 0, -dir.z  / Math.abs(dir.z))
    };
  }
  return null;
}

Item.prototype.getCrossSphere = function(from, dir) {
  var r = new Vec(from).sub(this.position);
  var s = this.size;
  var v = dir;

  var aa = v.x * v.x * s.x + v.y * v.y * s.y + v.z * v.z * s.z;
  var bb = r.x * v.x * s.x + r.y * v.y * s.y + r.z * v.z * s.z;
  var cc = r.x * r.x * s.x + r.y * r.y * s.y + r.z * r.z * s.z - 1;
  var dd = bb * bb - aa * cc;

  if (dd < 0) {
    return null;
  }

  var t;
  var t1 = (-bb - Math.sqrt(dd)) / aa;
  var t2 = (-bb + Math.sqrt(dd)) / aa;
  if (t1 < t2) {
    t = t1;
  } else {
    t = t2;
  }

  return {
    distance: t,
    normal: new Vec(
        s.x * (r.x + t * dir.x),
        s.y * (r.y + t * dir.y),
        s.z * (r.z + t * dir.z)).normalize()
  };
}

////////////////////////////////////////////////////////////////////////////
// class Shading
//

function Shading(src) {
  this.color = new Color(src.color);
  this.ambient = src.ambient;
  this.diffuse = src.diffuse;
  this.mirror  = src.mirror ;
  this.surface = src.surface;
  this.specular = src.specular;
}

////////////////////////////////////////////////////////////////////////////
// class RayTracer
//

function RayTracer(canvas, width, height, scene) {
  this.canvas = canvas;
  this.width = width;
  this.height = height;
  this.scene = scene;
  this.context2d = canvas.getContext('2d');
  this.imageData = this.context2d.getImageData(0, 0, width, height);
  this.rawData = this.imageData.data;
}

RayTracer.prototype.setup = function() {
  // FIXME: check this.scene contents.
  var d = this.d = {};

  d.camera = new Vec(this.scene.camera);
  d.target = new Vec(this.scene.target);
  d.light  = new Vec(this.scene.light);
  d.zoom   = this.scene.zoom;

  var v9 = new Vec(d.camera).sub(d.target).normalize();
  var v6 = new Vec(-v9.x * v9.y, 1 - v9.y * v9.y, -v9.z * v9.y);
  var v3 = new Vec(
      -(v9.y * v6.z - v9.z * v6.y),
      -(v9.z * v6.x - v9.x * v6.z),
      -(v9.x * v6.y - v9.y * v6.x));

  d.gaze = new Vec(v9).normalize();
  d.v3 = new Vec(v3).normalize();
  d.v6 = new Vec(v6).normalize();
  d.v12 = new Vec(d.light).normalize();

  d.items = [];
  for (var i = 0; i < this.scene.items.length; ++i) {
    d.items.push(new Item(this.scene.items[i]));
  }

  d.shadings = [];
  for (var i = 0; i < this.scene.shadings.length; ++i) {
    d.shadings.push(new Shading(this.scene.shadings[i]));
  }
}

RayTracer.prototype.render = function() {
  this.setup();
  var index = 0;
  for (var y = 0; y < this.height; ++y) {
    for (var x = 0; x < this.width; ++x) {
      var c = this.trace(x, y);
      if (c) {
        this.rawData[index + 0] = c.r();
        this.rawData[index + 1] = c.g();
        this.rawData[index + 2] = c.b();
        this.rawData[index + 3] = 255;
      } else {
        this.rawData[index + 0] = 0;
        this.rawData[index + 1] = 0;
        this.rawData[index + 2] = 0;
        this.rawData[index + 3] = 255;
      }
      index += 4;
    }
  }
  this.canvas.width = this.width
  this.canvas.height = this.height
  this.context2d.putImageData(this.imageData, 0, 0);
}

RayTracer.prototype.trace = function(x, y) {
  var fx = (x - this.width / 2) / 99;
  var fy = (this.height / 2 - y) / 99;
  var d = this.d;
  var v = new Vec(
      d.v3.x * fx + d.v6.x * fy - d.gaze.x * d.zoom,
      d.v3.y * fx + d.v6.y * fy - d.gaze.y * d.zoom,
      d.v3.z * fx + d.v6.z * fy - d.gaze.z * d.zoom).normalize();
  return this.traceRay(d.camera, v, 3);
}

RayTracer.prototype.traceRay = function(from, dir, depth) {
  var cross = this.getCross(from, dir);
  if (!cross) {
    return Black;
  }
  var pos = new Vec(from).add(new Vec(dir).mul(cross.distance));
  return this.shade(pos, dir, cross.normal, cross.shadeNum, depth);
}

RayTracer.prototype.getCross = function(from, dir) {
  var items = this.d.items;
  var r = {
    distance: Infinity,
    normal: null,
    shadeNum: -1,
  }
  for (var i = 0; i < items.length; ++i) {
    var n = items[i];
    var p = n.getCross(from, dir);
    if (p && p.distance < r.distance && p.distance > 1e-3) {
      r.distance = p.distance;
      r.normal = p.normal;
      r.shadeNum = n.shadeNum;
    }
  }
  return r.distance < Infinity ? r : null;
}

RayTracer.prototype.getShading = function(pos, shadeNum) {
  if (shadeNum < 0) {
    var x, y, z;
    x = Math.round(Math.abs(pos.x + 100) / 4);
    if (pos.x + 100 < 0) {
      x -= 1;
    }
    y = Math.round(Math.abs(pos.y + 100) / 4);
    if (pos.y + 100 < 0) {
      y -= 1;
    }
    z = Math.round(Math.abs(pos.z + 100) / 4);
    if (pos.z + 100 < 0) {
      z -= 1;
    }
    shadeNum = (x + y + z) % 2;
  }
  return this.d.shadings[shadeNum];
}

RayTracer.prototype.shade = function(pos, dir, normal, shadeNum, depth) {
  var s = this.getShading(pos, shadeNum);
  var d = this.d;

  var sm = normal.dot(new Vec(d.v12).sub(dir).normalize());
  if (sm < 0) {
    sm = 0;
  }
  for (var i = 0; i < s.specular; ++i) {
    sm *= sm;
  }

  var sn = normal.dot(d.v12);
  if (sn < 0) {
    sn = 0;
  }

  // shadow
  if (this.getCross(pos, d.v12)) {
    sm = 0;
    sn = 0;
  }

  var c = new Color(s.color).mul(s.ambient + s.diffuse * sn)
    .add(s.surface * sm);
  if (s.mirror < .01 || depth == 0) {
    return c;
  } else {
    var vn = -2 * normal.dot(dir);
    var w = new Vec(dir).add(new Vec(normal).mul(vn)).normalize();
    return c.add(this.traceRay(pos, w, depth - 1).mul(s.mirror));
  }
}

window.RayTracer = RayTracer;

})(this);
