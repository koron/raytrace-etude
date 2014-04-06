// Tiny Raytracer (C) Gabriel Gambetta 2013
// ----------------------------------------
//
//  Configuration and scene
//
// Size of the canvas. w is also reused as a "big constant" / "+infinity"
var w = 600;

// Sphere: radius, [cx,  cy,  cz], R,  G,  B, specular exponent, reflectiveness 
// R, G, B in [0, 9], reflectiveness in [0..9].
var spheres = [
  w, [ 0, -w, 0],  9, 9, 0,  w,  2,  // Yellow sphere
  1, [ 0,  0, 3],  9, 0, 0,  w,  3,  // Red sphere
  1, [-2,  1, 4],  0, 9, 0,  9,  4,  // Green sphere
  1, [ 2,  1, 4],  0, 0, 9,  w,  5   // Blue sphere
];

// Ambient light.
var ambient_light = 2;

// Point lights: intensity, [x,  y,  z]
// Intensities should add to 10, including ambient.
var lights = [
  8, [2, 2, 0]
];

// -----------------------------------------------------------------------------

// Shorten some names.
var math = Math;
var sqrt = math.sqrt;
var max = math.max;

// Global variables.
var out_idx = 0;

// Closure doesn't rename vars unless they're declared with "var", which takes
// space. So most vars are 1-letter and global:
//
// C: sphere center
// L: light vector
// N: surface normal at intersection
// X: intersection point
// a: quadratic equation constant
// b: quadratic equation constant
// c: color channel
// d: quadratic equation discriminant
// e: loop variable
// f: candidate parameter t
// h: half-width of the canvas
// i: illumination
// j: (ray origin) - (sphere center) 
// k: <N, L> 
// l: light index in loop
// n: <N, N>
// q: sphere index in loop
// r: sphere radius
// s: closest intersection sphere index
// t: closest intersection t
// u: intensity of lights[l] 
// v: closest sphere found in loop
//
// The exceptions are vars that need to be initialized here (we still pay the
// "a=", so we pay a single "var" above, and use nice names) and some vars in 
// trace_ray, which is recursive, so some of it vars can't be global.

// Get to the raw pixel data.
var canvas = document.getElementById("c");
var context2d = canvas.getContext("2d");
var image_data = context2d.getImageData(0, 0, w, w);
var raw_data = image_data.data;

canvas.width = canvas.height = w;

// Dot product.
function dot(A, B) {
  return A[0]*B[0] + A[1]*B[1] + A[2]*B[2];
}


// Helper: A_minus_Bk(A, B, k)  =  A - B*k. Since it's used more with k < 0,
// using - here saves a couple of bytes later.
function A_minus_Bk (A, B, k) {
  return [A[0] - B[0]*k, A[1] - B[1]*k, A[2] - B[2]*k];
}


// Find nearest intersection of the ray from B in direction D with any sphere.
// "Interesting" parameter values must be in the range [t_min, t_max].
// Returns the index within spheres of the center of the hit sphere, 0 if none.
// The parameter value for the intersection is in the global variable t.
function closest_intersection(B, D, t_min, t_max) {
  t = w;  // Min distance found.
  // Quadratic equation coefficients are K1, K2, K3. K1 is constant for the ray.
  a = 2*dot(D, D);  // 2*K1

  // For each sphere.
  // Get the radius and test for end of array at the same time; 
  // spheres[n] == undefined ends the loop.
  // q points to the 2nd element of the sphere because of q++; +6 skips to next
  // sphere.
  for (v = q = 0; r = spheres[q++]; q += 6) {  
    b = -2*dot(j = A_minus_Bk(B, spheres[q], 1), D);  // -K2; also j = origin - center
    
    // Compute sqrt(Discriminant) = sqrt(K2*K2 - 4*K1*K3), go ahead if there are
    // solutions.
    if ( d = sqrt(b*b - 2*a*(dot(j, j) - r*r)) ) {
      // Compute the two solutions.
      for (e = 2; e--; d = -d) {
        f = (b - d)/a;  // f = (-K2 - d) / 2*K1
        if (t_min < f && f < t_max && f < t) { 
          v = q;
          t = f;
        }
      }
    }
  }

  // Return index of closest sphere in range; t is global
  return v;
}


// Trace the ray from B with direction D considering hits in [t_min, t_max].
// If depth > 0, trace recursive reflection rays.
// Returns the value of the current color channel as "seen" through the ray.
function trace_ray(B, D, t_min, t_max, depth) {
  // Find nearest hit; if no hit, return black.
  if (!(s = closest_intersection(B, D, t_min, t_max)))
    return 0;
  
  // Compute "normal" at intersection: N = X - spheres[s]
  N = A_minus_Bk(X = A_minus_Bk(B, D, -t),  // intersection: X = B + D*t = B - D*(-t)
                 spheres[s], 1);

  // Instead of normalizing N, we divide by its length when appropriate. Most of
  // the time N appears twice, so we precompute its squared length.
  n = dot(N, N);

  // Start with ambient light only
  i = ambient_light;
  
  // For each light
  for (l = 0; u = lights[l++]; ) { // Get intensity and check for end of array

    // Compute vector from intersection to light (L = lights[l++] - X) and
    // k = <N,L> (reused below)
    k = dot(N, L = A_minus_Bk(lights[l++], X, 1));

    // Add to lighting
    i += u * 
      // If the pont isn't in shadow
      // [t_min, t_max]  =  [epsilon,  1] - epsilon avoids self-shadow, 1 
      // doesn't look farther than the light itself.
      !closest_intersection(X, L, 1/w, 1) * (
        // Diffuse lighting, only if it's facing the point 
        // <N,L> / (|N|*|L|) = cos(alpha)
        // Also, |N|*|L| = sqrt(<N,N>)*sqrt(<L,L>) = sqrt(<N,N>*<L,L>)
        max(0, k / sqrt(dot(L, L)*n))
      
        // Specular highlights
        //
        // specular = (<R,V>   / (|R|*|V|))   ^ exponent
        //          = (<-R,-V> / (|-R|*|-V|)) ^ exponent
        //          = (<-R,D>  / (|-R|*|D|))  ^ exponent
        //
        // R = 2*N*<N,L> - L
        // M = -R = -2*N*<N,L> + L = L + N*(-2*<N,L>)
        //
        // If the resultant intensity is negative, treat it as 0 (ignore it).
          + max(0, math.pow( dot(M = A_minus_Bk(L, N, 2*k/n), D) 
              / sqrt(dot(M, M)*dot(D, D)), spheres[s+4]))
      );
  }
  

  // Compute the color channel multiplied by the light intensity. 2.8 maps
  // the color range from [0, 9] to [0, 255] and the intensity from [0, 10]
  // to [0, 1],  because 2.8 ~ (255/9)/10
  // 
  // spheres[s] = sphere center, so spheres[s+c] = color channel
  // (c = [1..3] because ++c below)
  var local_color = spheres[s+c]*i*2.8;
  
  // If the recursion limit hasn't been hit yet, trace reflection rays.
  // N = normal (non-normalized - two divs by |N| = div by <N,N>
  // D = -view
  // R = 2*N*<N,V>/<N,N> - V = 2*N*<N,-D>/<N,N> + D = D - N*(2*<N,D>/<N,N>)
  var ref = spheres[s+5]/9;
  return depth-- ? trace_ray(X,
                             A_minus_Bk(D, N, 2*dot(N, D)/n),  // R
                             1/w, w, depth)*ref
                   + local_color*(1 - ref)
                 : local_color;
}

// For each y; also compute h=w/2 without paying an extra ";"
for (y = h=w/2; y-- > -h;) {

  // For each x
  for (x = -h; x++ < h;) {

    // One pass per color channel (!). This way we don't have to deal with
    // "colors".
    for (c = 0; ++c < 4;) {
      // Camera is at (0, 1, 0)
      //
      // Ray direction is (x*vw/cw, y*vh/ch, 1) where vw = viewport width, 
      // cw = canvas width (vh and ch are the same for height). vw is fixed
      // at 1 so (x/w, y/w, 1)
      //
      // [t_min, t_max] = [1, w], 1 starts at the projection plane, w is +inf
      //
      // 2 is a good recursion depth to appreciate the reflections without
      // slowing things down too much
      //
      raw_data[out_idx++] = trace_ray([0, 1, 0], [x/w, y/w, 1], 1, w, 2);
    }
    raw_data[out_idx++] = 255; // Opaque alpha
  }
}

context2d.putImageData(image_data, 0, 0);

