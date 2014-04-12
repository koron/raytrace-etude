package main

import (
	"image"
)

type Data struct {
	Scene
	Gaze V3d
}

func NewData(s Scene) Data {
	return Data{
		Scene: s,
		Gaze: s.Target.Sub(s.Camera).Norm(),
	}
}

func trace_ray() Color {
	// TODO:
	return Color{0, 0, 0}
}

func Render(s Scene, i *image.RGBA) error {
	w, h := size(i)
	for y := 0; y < h; y += 1 {
		for x := 0; x < w; x += 1 {
			c := trace_ray()
			i.Set(x, y, &c)
		}
	}
	// TODO:
	return nil
}
