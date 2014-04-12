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
