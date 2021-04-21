// dot-app3.ts
//
// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import {
    Domain3,
    DotRenderer3,
    Camera,
    Vector3,
    InputState,
    Matrix4,
    App,
    UI,
    ImageCombo,
    GeonImage,
    Context,
} from "../../src/lib";

export class UITestApp extends App {
    context: Context;
    images: ImageCombo;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        this.context = new Context(new Camera(canvas));
        this.images = ImageCombo.new(gl);
    }

    ui(ui: UI) {}

    start() {
        let img = new GeonImage(10, 10, 4);
        img.fill([255, 255, 255, 255]);
        this.images.add(img);
    }

    update(state: InputState) {
        // move the camera with the mouse
        this.context.camera.update(state);

        if (state.mouseLeftPressed) {
        }
    }

    draw(gl: WebGLRenderingContext) {
        this.images.draw(this.context);
    }
}
