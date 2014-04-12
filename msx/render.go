package main

import (
	"image"
)

func size(i image.Image) (w, h int) {
	r := i.Bounds()
	w = r.Max.X - r.Min.X
	h = r.Max.Y - r.Min.Y
	return
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
