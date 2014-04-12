package main

type Color struct {
	R, G, B float64
}

func regulate(v float64) float64 {
	if v < 0 {
		return 0
	} else if v > 1 {
		return 1
	} else {
		return v
	}
}

func (c *Color) RGBA() (r, g, b, a uint32) {
	r = uint32(regulate(c.R) * 0xFFFF)
	g = uint32(regulate(c.G) * 0xFFFF)
	b = uint32(regulate(c.B) * 0xFFFF)
	a = 0xFFFF
	return
}

func (c Color) Add(d Color) Color {
	return Color{c.R + d.R, c.G + d.G, c.B + d.B}
}

func (c Color) Mul(v float64) Color {
	return Color{c.R * v, c.G * v, c.B * v}
}
