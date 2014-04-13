package main

import (
	"log"
	"math"
)

type Scene struct {
	Camera   V3d
	Target   V3d
	Light    V3d
	Zoom     float64
	Objects  []Object
	Shadings []Shading
}

type Shading struct {
	Color
	Ambient     float64
	Diffuse     float64
	Mirror      float64
	Surface     float64
	Specularity int
}

type Object struct {
	Position      V3d
	Size          V3d
	Type
	ShadingNumber int
}

func (o Object) Intersection(c, v V3d) (t float64, n V3d) {
	t = math.Inf(0)
	r := c.Sub(o.Position)
	switch o.Type {
	case Box:
		var t1, t2, t3 float64
		if v.X == 0 {
			t1 = math.Inf(0)
		} else if r.X < 0 {
			t1 = -(r.X + o.Size.X) / v.X
		} else {
			t1 = -(r.X + o.Size.X) / v.X
		}
		if v.Y == 0 {
			t2 = math.Inf(0)
		} else if r.Y < 0 {
			t2 = -(r.Y + o.Size.Y) / v.Y
		} else {
			t2 = -(r.Y - o.Size.Y) / v.Y
		}
		if v.Z == 0 {
			t3 = math.Inf(0)
		} else if r.Z < 0 {
			t3 = -(r.Z + o.Size.Z) / v.Z
		} else {
			t3 = -(r.Z - o.Size.Z) / v.Z
		}

		if math.Abs(r.Y + t1 * v.Y) > o.Size.Y || math.Abs(r.Z + t1 * v.Z) > o.Size.Z {
			t1 = math.Inf(0)
		}
		if math.Abs(r.Z + t2 * v.Z) > o.Size.Z || math.Abs(r.X + t2 * v.X) > o.Size.X {
			t2 = math.Inf(0)
		}
		if math.Abs(r.Y + t3 * v.X) > o.Size.X || math.Abs(r.Y + t3 * v.Y) > o.Size.Y {
			t3 = math.Inf(0)
		}

		if t1 <= t2 && t1 <= t3 {
			t = t1
			n = V3d{-v.X / math.Abs(v.X), 0, 0}
		}
		if t2 <= t3 && t2 <= t1 {
			t = t2
			n = V3d{0, -v.Y / math.Abs(v.Y), 0}
		}
		if t3 <= t1 && t3 <= t2 {
			t = t3
			n = V3d{0, 0, -v.Z / math.Abs(v.Z)}
		}

	case Sphere:
		aa := v.X * v.X * o.Size.Y + v.Y * v.Y * o.Size.Y + v.Z * v.Z * o.Size.Z
		bb := r.X * v.X * o.Size.Y + r.Y * v.Y * o.Size.Y + r.Z * v.Z * o.Size.Z
		cc := r.X * r.X * o.Size.Y + r.Y * r.Y * o.Size.Y + r.Z * r.Z * o.Size.Z - 1
		dd := bb * bb - aa * cc
		if dd < 0 {
			return
		}

		t1 := (-bb - math.Sqrt(dd)) / aa
		t2 := (-bb + math.Sqrt(dd)) / aa
		if t1 < t2 {
			t = t1
		} else {
			t = t2
		}

		n = V3d{
			o.Size.X * + t * v.X,
			o.Size.Y * + t * v.Y,
			o.Size.Z * + t * v.Z,
		}.Norm()

	default:
		log.Fatal("Unknown object type", o.Type)
	}
	return
}

type Type int

const (
	Box Type = iota
	Sphere
)
