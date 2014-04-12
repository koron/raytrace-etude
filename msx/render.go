package main

import (
	"image"
	"math"
)

type Data struct {
	Scene
	Near float64
	Gaze V3d
}

func NewData(s Scene) Data {
	return Data{
		Scene: s,
		Near:  1e-3,
		Gaze:  s.Target.Sub(s.Camera).Norm(),
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
		for x := 0; x < w; x += 1 {
			// TODO: calc v.
			v := V3d{0, 0, 0}
			c := trace_ray(d, v)
			i.Set(x, y, &c)
		}
	}
	return nil
}
