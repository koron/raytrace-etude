(function(window) {
function fragmentShader() {/*
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform vec3 mouse;

#define EPS 1e-8
#define INF 1e8

vec3 rotX(vec3 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec3(p.x, p.z * s + p.y * c, p.z * c - p.y * s);
}

vec3 rotY(vec3 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec3(p.z * s + p.x * c, p.y, p.z * c - p.x * s);
}

vec3 rotZ(vec3 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec3(
      p.x * c + p.y * s,
      p.x * s - p.y * c,
      p.z);
}


vec3 camera;
const vec3 target = vec3(0.0, 0.0, 0.0);
const vec3 light = vec3(-8.0, 9.0, -3.0);
const float zoom = 6.0;

vec3 v12, v9, v6, v3, gaze;

struct CrossInfo {
    float distance;
    vec3 normal;
    int shadeNum;
    bool isHit;
};

struct ShadingParams {
    vec3 color;
    float ambient;
    float diffuse;
    float mirror;
    float surface;
    float specular;
};

struct ShadingResult {
    vec3 color;
    float mirror;
};

struct TraceResult {
    vec3 position;
    vec3 normal;
    vec3 color;
    float mirror;
};

void setup() {

    camera = vec3(mouse.z, 0.0, 0.0);
    camera = rotZ(camera, mouse.y * 3.14159265);
    camera = rotY(camera, mouse.x * 3.14159265);

    //vec2 mp = mouse * 2.0 - 1.0;
    //camera = vec3(20.0, 40.0, 20.0);
    //camera = rotY(vec3(20.0, 20.0 *(1.0 + mp.y), 20.0), mp.x * -3.14159);

    v9 = normalize(camera - target);
    v6 = vec3(0.0, 1.0, 0.0) - v9 * v9.y;
    v3 = -cross(v9, v6);
    gaze = v9;
    v3 = normalize(v3);
    v6 = normalize(v6);
    v12 = normalize(light);
}

CrossInfo getCrossBox(vec3 from, vec3 dir, vec3 position, vec3 size) {
    float t1, t2, t3;
    vec3 r = from - position;
    vec3 s = size;
    CrossInfo c;
    c.distance = INF;
    c.isHit = false;

    if(r.x < -EPS) {
        t1 = -(r.x + s.x) / dir.x;
    } else if(r.x > EPS) {
        t1 = -(r.x - s.x) / dir.x;
    } else {
        t1 = INF;
    }
    if(r.y < -EPS) {
        t2 = -(r.y + s.y) / dir.y;
    } else if(r.y > EPS) {
        t2 = -(r.y - s.y) / dir.y;
    } else {
        t2 = INF;
    }
    if(r.z < -EPS) {
        t3 = -(r.z + s.z) / dir.z;
    } else if(r.z > EPS) {
        t3 = -(r.z - s.z) / dir.z;
    } else {
        t3 = INF;
    }

    if(abs(r.y + t1 * dir.y) > s.y || abs(r.z + t1 * dir.z) > s.z) {
        t1 = INF;
    }
    if(abs(r.z + t2 * dir.z) > s.z || abs(r.x + t2 * dir.x) > s.x) {
        t2 = INF;
    }
    if(abs(r.x + t3 * dir.x) > s.x || abs(r.y + t3 * dir.y) > s.y) {
        t3 = INF;
    }

    if(t1 <= t2 && t1 <= t3) {
        c.distance = t1;
        c.normal = vec3(-dir.x / abs(dir.x), 0.0, 0.0);
        c.isHit = true;
    } else if(t2 <= t1 && t2 <= t3) {
        c.distance = t2;
        c.normal = vec3(0.0, -dir.y / abs(dir.y), 0.0);
        c.isHit = true;
    } else if(t3 <= t1 && t3 <= t2) {
        c.distance = t3;
        c.normal = vec3(0.0, 0.0, -dir.z / abs(dir.z));
        c.isHit = true;
    }

    return c;
}

CrossInfo getCrossSphere(vec3 from, vec3 dir, vec3 position, vec3 size) {
    vec3 r = from - position;
    vec3 s = size;
    vec3 v = dir;
    CrossInfo c;
    c.distance = INF;
    c.isHit = false;

    float aa = dot(v, v * s);
    float bb = dot(r, v * s);
    float cc = dot(r, r * s) - 1.0;
    float dd = bb * bb - aa * cc;

    if(dd < EPS) {
        return c;
    }

    float t = min(-bb - sqrt(dd), -bb - sqrt(dd)) / aa;
    c.distance = t;
    c.normal = normalize(s * (r + dir * t));
    c.isHit = true;

    return c;
}

CrossInfo getCross(vec3 from, vec3 dir) {
    CrossInfo r, p;
    r.isHit = false;
    r.shadeNum = -1;
    r.distance = INF;

    // spheres
    p = getCrossSphere(from, dir, vec3(2.0, 0.0, 2.0), vec3(0.2));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = 2;
    }

    p = getCrossSphere(from, dir, vec3(-2.0, 2.0, 2.0), vec3(0.2));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = 3;
    }

    p = getCrossSphere(from, dir, vec3(-6.0, 4.0, 2.0), vec3(0.2));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = 4;
    }

    p = getCrossSphere(from, dir, vec3(-2.0, 2.0, -2.0), vec3(0.2));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = 5;
    }

    p = getCrossSphere(from, dir, vec3(-6.0, 4.0, -6.0), vec3(0.2));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = 6;
    }

    // box
    p = getCrossBox(from, dir, vec3(0.0, -2.0, 0.0), vec3(20.0, 1.0, 20.0));
    if(p.isHit && p.distance < r.distance && p.distance > 1e-3) {
        r = p;
        r.shadeNum = -1;
    }

    return r;
}


ShadingParams getShadeNum(vec3 pos, int shadeNum) {
    ShadingParams s;

    if(shadeNum < 0) {
        vec3 p = floor(abs(pos + 100.0) / 4.0);
        if(pos.x + 100.0 < 0.0) { p.x -= 1.0; }
        if(pos.y + 100.0 < 0.0) { p.y -= 1.0; }
        if(pos.z + 100.0 < 0.0) { p.z -= 1.0; }
        shadeNum = int(mod((p.x + p.y + p.z), 2.0));
    }

    if(shadeNum == 0) {
        s.color = vec3(0.9);
        s.ambient = 0.5;
        s.diffuse = 0.4;
        s.mirror = 0.6;
        s.surface = 0.7;
        s.specular = 6.0;
        return s;
    }

    if(shadeNum == 1) {
        s.color = vec3(0.0, 0.9, 0.0);
        s.ambient = 0.5;
        s.diffuse = 0.4;
        s.mirror = 0.6;
        s.surface = 0.7;
        s.specular = 6.0;
        return s;
    }

    if(shadeNum == 2) {
        s.color = vec3(0.9, 0.0, 0.0);
        s.ambient = 0.3;
        s.diffuse = 0.6;
        s.mirror = 0.0;
        s.surface = 0.0;
        s.specular = 0.0;
        return s;
    }

    if(shadeNum == 3) {
        s.color = vec3(0.9);
        s.ambient = 0.3;
        s.diffuse = 0.6;
        s.mirror = 0.0;
        s.surface = 0.6;
        s.specular = 8.0;
        return s;
    }

    if(shadeNum == 4) {
        s.color = vec3(0.0, 0.0, 0.9);
        s.ambient = 0.3;
        s.diffuse = 0.6;
        s.mirror = 0.0;
        s.surface = 0.6;
        s.specular = 8.0;
        return s;
    }

    if(shadeNum == 5) {
        s.color = vec3(0.9);
        s.ambient = 0.3;
        s.diffuse = 0.6;
        s.mirror = 0.0;
        s.surface = 0.6;
        s.specular = 6.0;
        return s;
    }

    //if(shadeNum >= 6)
    {
        s.color = vec3(0.0);
        s.ambient = 0.3;
        s.diffuse = 0.6;
        s.mirror = 1.0;
        s.surface = 0.9;
        s.specular = 8.0;
        //return s;
    }

    return s;
}

ShadingResult shade(vec3 pos, vec3 dir, vec3 normal, int shadeNum, int depth) {
    ShadingParams s = getShadeNum(pos, shadeNum);

    float sm = dot(normal, normalize(v12 - dir));
    sm = max(0.0, sm);
    sm = pow(sm, pow(2.0, s.specular));

    float sn = dot(normal, v12);
    sn = max(0.0, sn);

    if (getCross(pos, v12).isHit) {
        sm = 0.0;
        sn = 0.0;
    }

    ShadingResult sr;
    sr.color = s.color * (s.ambient + s.diffuse * sn) + s.surface * sm;
    sr.mirror = s.mirror;

    return sr;
}

TraceResult traceRay(vec3 from, vec3 dir, int depth) {
    TraceResult tr;

    CrossInfo c = getCross(from, dir);
    if(!c.isHit) {
        tr.color = vec3(0.0);
        //tr.color = mix(vec3(0.9, 0.9, 1.0), vec3(0.6, 0.6, 0.9), abs(dir.y));
        tr.mirror = 0.0;
        return tr;
    }
    vec3 pos = from + dir * c.distance;

    ShadingResult sr = shade(pos, dir, c.normal, c.shadeNum, depth);
    tr.position = pos;
    tr.normal = c.normal;
    tr.color = sr.color;
    tr.mirror = sr.mirror;

    return tr;
}

vec3 trace(vec2 s) {
    vec2 f = (s - resolution * 0.5) / 99.0;
    vec3 v = normalize(v3 * f.x + v6 * f.y - gaze * zoom);

    vec3 color = vec3(0.0);
    float weight = 1.0;
    vec3 p = camera;
    for (int i = 0; i < 3; i++) {
        TraceResult tr = traceRay(p, v, 3);

        color += tr.color * weight; // This is original blend expression.
        //color = mix(color, tr.color, weight);
        weight *= tr.mirror;

        if (tr.mirror < 0.01) break;

        p = tr.position;
        float vn = -2.0 * dot(tr.normal, v);
        v = normalize(v + tr.normal * vn);
    }

    return color;
}

vec3 render() {
    setup();
    return trace(gl_FragCoord.xy);
}

void main(void) {
    vec3 rgb = render();
    gl_FragColor = vec4(rgb, 1.0);

}
*/}

window.fragmentShaderSrc = function() {
  return fragmentShader.toString().slice(29, -3);
}

})(window);
