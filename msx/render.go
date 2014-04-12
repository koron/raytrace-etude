package main

import (
	"image"
	"math"
)

type Data struct {
	Scene
	Near float64
	Gaze V3d
	V3 V3d
	V6 V3d
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
		Gaze:  v9,
		V3:    v3,
		V6:    v6,
	}
}

func cross(d Data, v V3d) (o *Object, tt float64, l V3d) {
	tt = math.Inf(0)
	for _, p := range d.Scene.Objects {
		t, n := p.Intersection(d.Scene.Camera, v)
		if t < tt && t > d.Near {
			tt = t
			l = n
			o = &p
		}
	}
	return
}

func trace_ray(d Data, v V3d) Color {
	o, _, _ := cross(d, v)
	if o == nil {
		return Color{0, 0, 0}
	}

	// TODO: shade

	return Color{0, 0, 0}
}

func Render(s Scene, i *image.RGBA) error {
	d := NewData(s)
	w, h := size(i)
	for y := 0; y < h; y += 1 {
		fy := float64(h / 2 - y) / 99.0
		for x := 0; x < w; x += 1 {
			fx := float64(x - w / 2) / 99.0
			v := V3d{
				d.V3.X * fx + d.V6.X * fy - d.Gaze.X * d.Scene.Zoom,
				d.V3.Y * fx + d.V6.Y * fy - d.Gaze.Y * d.Scene.Zoom,
				d.V3.Z * fx + d.V6.Z * fy - d.Gaze.Z * d.Scene.Zoom,
			}.Norm()
			c := trace_ray(d, v)
			i.Set(x, y, &c)
		}
	}
	return nil
}
