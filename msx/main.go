// Port of MSX2+ パワフル活用法

package main

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"os"
	"time"
)

func save(s Scene, w, h int, fname string) error {
	// Create a canvas (=image) and render to it.
	c := image.NewRGBA(image.Rect(0, 0, w, h))
	b := time.Now()
	err := Render(s, c)
	d := time.Since(b)
	fmt.Println(d)
	if err != nil {
		return err
	}

	// Open file to output PNG.
	f, err := os.Create(fname)
	if err != nil {
		return nil
	}
	defer f.Close()

	// Write as PNG.
	err = png.Encode(f, c)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	s := Scene1()
	err := save(s, 256, 212, "out.png")
	if err != nil {
		log.Fatal(err)
	}
}
