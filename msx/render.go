package main

import (
	"image"
	"math"
)

type Data struct {
	Scene
	Near float64
	Pt   float64
	Gaze V3d
	V3   V3d
	V6   V3d
	V12  V3d
}

func NewData(s Scene) Data {
	v9 := s.Camera.Sub(s.Target).Norm()
	v6 := V3d{-v9.X * v9.Y, 1 - v9.Y*v9.Y, -v9.Z * v9.Y}
	v3 := V3d{
		-(v9.Y*v6.Z - v9.Z*v6.Y),
		-(v9.Z*v6.X - v9.X*v6.Z),
		-(v9.X*v6.Y - v9.Y*v6.X),
	}
	return Data{
		Scene: s,
		Near:  1e-3,
		Pt:    4,
		Gaze:  v9.Norm(),
		V3:    v3.Norm(),
		V6:    v6.Norm(),
		V12:   s.Light.Norm(),
	}
}

func cross(d Data, v V3d) (o *Object, tt float64, l V3d) {
	tt = math.Inf(0)
	for i, p := range d.Scene.Objects {
		t, n := p.Intersection(d.Scene.Camera, v)
		if t < tt && t > d.Near {
			tt = t
			l = n
			o = &d.Scene.Objects[i]
		}
	}
	return
}

func shade(d Data, c, v V3d, o Object, l V3d, depth int) Color {
	sh := o.ShadingNumber
	if sh < 0 {
		px := int(math.Abs(c.X+100) / d.Pt)
		if c.X+100 < 0 {
			px -= 1
		}
		py := int(math.Abs(c.Y+100) / d.Pt)
		if c.Y+100 < 0 {
			py -= 1
		}
		pz := int(math.Abs(c.Z+100) / d.Pt)
		if c.Z+100 < 0 {
			pz -= 1
		}
		sh = (px + py + pz) % 2
	}
	s := d.Scene.Shadings[sh]

	j := d.V12.Sub(v)
	sm := l.Dot(j.Norm())
	if sm < 0 {
		sm = 0
	}
	for i := 0; i < s.Specularity; i += 1 {
		sm = sm * sm
	}

	sn := l.Dot(d.V12.Norm())
	if sn < 0 {
		sn = 0
	}

	// TODO: shade

	co := s.Color.Mul(s.Ambient + s.Diffuse*sn).AddSingle(s.Surface * sm)
	if s.Mirror < .01 || depth == 0 {
		return co
	} else {
		vn := -2 * (l.Dot(v))
		w := v.Add(l.Mul(vn)).Norm()
		//w := V3d{v.X + vn*l.X, v.Y + vn*l.Y, v.Z + vn*l.Z}
		return co.Add(trace_ray(d, c, w, depth-1).Mul(s.Mirror))
	}
}

func trace_ray(d Data, c, v V3d, depth int) Color {
	o, t, l := cross(d, v)
	if o == nil {
		return Color{0, 0, 0}
	}
	c = c.Add(v.Mul(t))
	return shade(d, c, v, *o, l, depth)
}

func Render(s Scene, i *image.RGBA) error {
	d := NewData(s)
	w, h := size(i)
	for y := 0; y < h; y += 1 {
		fy := float64(h/2-y) / 99.0
		for x := 0; x < w; x += 1 {
			fx := float64(x-w/2) / 99.0
			v := V3d{
				d.V3.X*fx + d.V6.X*fy - d.Gaze.X*d.Scene.Zoom,
				d.V3.Y*fx + d.V6.Y*fy - d.Gaze.Y*d.Scene.Zoom,
				d.V3.Z*fx + d.V6.Z*fy - d.Gaze.Z*d.Scene.Zoom,
			}.Norm()
			c := trace_ray(d, d.Scene.Camera, v, 3)
			i.Set(x, y, &c)
		}
	}
	return nil
}
