// port of tiny_raytrace: http://www.gabrielgambetta.com/tiny_raytracer.html

package main

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"math"
	"os"
	"sync"
	"time"
)

type V3d struct {
	X, Y, Z float64
}

func (v V3d) Dot(w V3d) float64 {
	return v.X*w.X + v.Y*w.Y + v.Z*w.Z
}

func (v V3d) MinusK(w V3d, k float64) V3d {
	return V3d{
		v.X - w.X*k,
		v.Y - w.Y*k,
		v.Z - w.Z*k,
	}
}

type Color struct {
	R, G, B float64
}

func (c *Color) RGBA() (r, g, b, a uint32) {
	r = uint32(math.Min(1, c.R) * 0xFFFF)
	g = uint32(math.Min(1, c.G) * 0xFFFF)
	b = uint32(math.Min(1, c.B) * 0xFFFF)
	a = 0xFFFF
	return
}

func (c Color) Mul(v float64) Color {
	return Color{c.R * v, c.G * v, c.B * v}
}

func (c Color) Add(d Color) Color {
	return Color{c.R + d.R, c.G + d.G, c.B + d.B}
}

type sphere struct {
	radius         float64
	position       V3d
	color          Color
	specular       float64
	reflectiveness float64
}

type light struct {
	intensity float64
	position  V3d
}

type world struct {
	big     float64
	spheres []sphere
	ambient float64
	lights  []light
}

func main() {
	var w float64 = 600

	g := world{
		w,
		[]sphere{
			sphere{w, V3d{0, -w, 0}, Color{1, 1, 0}, w, 2},
			sphere{1, V3d{0, 0, 3}, Color{1, 0, 0}, w, 3},
			sphere{1, V3d{-2, 1, 4}, Color{0, 1, 0}, 9, 4},
			sphere{1, V3d{2, 1, 4}, Color{0, 0, 1}, w, 5},
		},
		2,
		[]light{
			light{8, V3d{2, 2, 0}},
		},
	}

	err := tiny_raytrace(g, int(w), "out.png")
	if err != nil {
		log.Fatal(err)
	}
}

func tiny_raytrace(g world, w int, fname string) error {
	rgba := image.NewRGBA(image.Rect(0, 0, w, w))
	s := time.Now()
	err := render(g, rgba)
	t := time.Since(s)
	fmt.Println(t)
	if err != nil {
		return err
	}

	f, err := os.Create(fname)
	if err != nil {
		return err
	}
	defer f.Close()

	err = png.Encode(f, rgba)
	if err != nil {
		return err
	}

	return nil
}

func closest_intersection(g world, b, d V3d, min, max float64) (*sphere, float64) {
	var s *sphere = nil
	t := math.Inf(0)
	a := 2 * d.Dot(d)
	for i, q := range g.spheres {
		j := b.MinusK(q.position, 1)
		b2 := -2 * j.Dot(d)
		d2 := math.Sqrt(b2*b2 - 2*a*(j.Dot(j)-q.radius*q.radius))
		for _, d3 := range []float64{d2, -d2} {
			if !math.IsNaN(d3) {
				f := (b2 - d3) / a
				if min < f && f < max && f < t {
					s = &g.spheres[i]
					t = f
				}
			}
		}
	}
	return s, t
}

func trace_ray(g world, b, d V3d, min, max float64, depth int) Color {
	s, t := closest_intersection(g, b, d, min, max)
	if s == nil {
		return Color{0, 0, 0}
	}

	d2 := d.Dot(d)
	x := b.MinusK(d, -t)
	n := x.MinusK(s.position, 1)
	n2 := n.Dot(n)
	i := g.ambient

	// For each light
	for _, light := range g.lights {
		l := light.position.MinusK(x, 1)
		k := n.Dot(l)
		s2, _ := closest_intersection(g, x, l, 1/g.big, 1)
		if s2 == nil {
			v1 := math.Max(0, k/math.Sqrt(l.Dot(l)*n2))
			m := l.MinusK(n, 2*k/n2)
			m2 := m.Dot(m)
			v2a := m.Dot(d) / math.Sqrt(m2 * d2)
			v2 := math.Max(0, math.Pow(v2a, s.specular))
			i += light.intensity * (v1 + v2)
		}
	}

	c1 := s.color.Mul(i / 10)
	if depth == 0 {
		return c1
	}

	r := s.reflectiveness / 9
	c2 := trace_ray(g, x, d.MinusK(n, 2*n.Dot(d)/n2), 1/g.big, g.big, depth-1)
	return c2.Mul(r).Add(c1.Mul(1 - r))
}

func render(g world, rgba *image.RGBA) error {
	b := V3d{0, 1, 0}
	r := rgba.Bounds()
	w := float64(r.Max.X - r.Min.X)
	h := float64(r.Max.Y - r.Min.Y)
	var wg sync.WaitGroup
	drawline := func (y int) {
		for x := r.Min.X; x < r.Max.X; x += 1 {
			d := V3d{(float64(x) - w/2) / w, (h/2 - float64(y)) / h, 1}
			c := trace_ray(g, b, d, 1, g.big, 2)
			rgba.Set(x, y, &c)
		}
		wg.Done()
	}
	for y := r.Min.Y; y < r.Max.Y; y += 1 {
		wg.Add(1)
		go drawline(y)
	}
	wg.Wait()
	return nil
}
