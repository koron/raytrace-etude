package main

func Scene1() Scene {
	return Scene{
		Camera: V3d{20, 40, 20},
		Target: V3d{0, 0, 0},
		Light:  V3d{-8, 9, -3},
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

func Scene2() Scene {
	return Scene{
		Camera: V3d{20, 40, 20},
		Target: V3d{0, 0, 0},
		Light:  V3d{-8, 9, -3},
		Zoom:   6,
		Objects: []Object{
			Object{V3d{2, 0, 2}, V3d{.2, .2, .2}, 1, 2},
			Object{V3d{-2, 2, 2}, V3d{.2, .2, .2}, 1, 3},
			Object{V3d{-6, 4, 2}, V3d{.2, .2, .2}, 1, 4},
			Object{V3d{-2, 2, -2}, V3d{.2, .2, .2}, 1, 5},
			Object{V3d{-6, 4, -6}, V3d{.2, .2, .2}, 1, 6},
			Object{V3d{0, -2, 0}, V3d{20, 1, 20}, 0, -1},
		},
		Shadings: []Shading{
			Shading{Color{.9, .9, .9}, .5, .4, .6, .7, 6},
			Shading{Color{.0, .9, .0}, .5, .4, .6, .7, 6},
			Shading{Color{.9, .0, .0}, .3, .6, 0, .0, 0},
			Shading{Color{.9, .9, .9}, .3, .6, 0, .6, 8},
			Shading{Color{.0, .0, .9}, .3, .6, 0, .6, 8},
			Shading{Color{.9, .9, .9}, .3, .6, 0, .6, 6},
			Shading{Color{.0, .0, .0}, .3, .6, 1, .9, 8},
		},
	}
}
