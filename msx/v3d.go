package main

type V3d struct {
	X, Y, Z float64
}

func (v V3d) Dot(w V3d) float64 {
	return v.X*w.X + v.Y*w.Y + v.Z*w.Z
}
