package main

func Scene1() Scene {
	return Scene{
		Camera: V3d{20, 40, 20},
		Target: V3d{0, 0, 0},
		Light:  V3d{-8, -9, 3},
		Zoom:   6,
		Objects: []Object{
			Object{V3d{-2, 0, -2}, V3d{.2, .2, .2}, 1, 0},
			Object{V3d{2, 0, 2}, V3d{.2, .2, .2}, 1, 1},
			Object{V3d{-2, 0, 2}, V3d{.2, .2, .2}, 1, 2},
			Object{V3d{2, 0, -2}, V3d{.2, .2, .2}, 1, 3},
		},
		Shadings: []Shading{
			Shading{Color{.4, .8, .6}, .3, .6, 0, 0, 0},
			Shading{Color{.4, .8, .6}, .3, .6, 0, .6, 2},
			Shading{Color{.4, .8, .6}, .3, .6, 0, .6, 4},
			Shading{Color{.4, .8, .6}, .3, .6, 0, .6, 6},
		},
	}
}
