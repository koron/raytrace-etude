package main

import (
	"math"
)

type V3d struct {
	X, Y, Z float64
}

func (v V3d) Add(w V3d) V3d {
	return V3d{v.X + w.X, v.Y + w.Y, v.Z + w.Z}
}

func (v V3d) Sub(w V3d) V3d {
	return V3d{v.X - w.X, v.Y - w.Y, v.Z - w.Z}
}

func (v V3d) Dot(w V3d) float64 {
	return v.X*w.X + v.Y*w.Y + v.Z*w.Z
}

func (v V3d) Mul(n float64) V3d {
	return V3d{v.X * n, v.Y * n, v.Z * n}
}

func (v V3d) Div(n float64) V3d {
	return V3d{v.X / n, v.Y / n, v.Z / n}
}

func (v V3d) Len() float64 {
	return math.Sqrt(v.Dot(v))
}

func (v V3d) Norm() V3d {
	return v.Div(v.Len())
}
