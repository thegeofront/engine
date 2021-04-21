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
    Context,
} from "../../src/lib";

export class DotApp3 extends App {
    dots: Vector3[] = [];
    dirs: Vector3[] = [];

    bounds: Domain3;
    whiteDotRend: DotRenderer3;
    redDotRend: DotRenderer3;
    camera: Camera;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        let n = 1;
        this.bounds = Domain3.fromBounds(-n, n, -n, n, -n, n);
        this.whiteDotRend = new DotRenderer3(gl, 10, [1, 1, 1, 1], false);
        this.redDotRend = new DotRenderer3(gl, 10, [1, 0, 0, 1], false);
        this.camera = new Camera(canvas);
    }

    start() {
        this.spawnSome(100, 0.001);
    }

    spawnSome(count: number, normrange: number) {
        const normSpace = Domain3.fromBounds(
            -normrange,
            normrange,
            -normrange,
            normrange,
            -normrange,
            normrange,
        );

        for (let i = 0; i < count; i++) {
            this.dots.push(this.bounds.elevate(Vector3.fromRandom()));
            this.dirs.push(normSpace.elevate(Vector3.fromRandom()));
        }
    }

    update(state: InputState) {
        // move the camera with the mouse
        this.camera.update(state);

        if (state.mouseLeftPressed) {
            this.spawnSome(100, 0.001);
        }

        // update the position of all dots
        for (let i = 0; i < this.dots.length; i++) {
            // this gives us a pointer apparantly
            let dot = this.dots[i];
            let dir = this.dirs[i];

            // bounce of the edges
            if (!this.bounds.x.includes(dot.x)) dir.x = -dir.x;
            if (!this.bounds.y.includes(dot.y)) dir.y = -dir.y;
            if (!this.bounds.z.includes(dot.z)) dir.z = -dir.z;

            // update position
            dot.add(dir);
        }
    }

    draw(gl: WebGLRenderingContext) {
        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;
        let c = new Context(this.camera);

        // render the corners of the box with the red renderer,
        // and the dots themselves with the white renderer
        this.redDotRend.setAndRender(this.bounds.corners(Matrix4.newIdentity()), c);
        this.whiteDotRend.setAndRender(this.dots, c);
    }
}
