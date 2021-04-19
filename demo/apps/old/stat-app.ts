import {
    App,
    DotRenderer3,
    LineRenderer,
    SimpleMeshRenderer,
    Camera,
    Renderable,
    Vector3,
    LineArray,
    FloatMatrix,
    Stat,
    InputState,
} from "../../../src/lib";

// good sites explaining the power of least squares
// https://courses.physics.illinois.edu/cs357/sp2020/notes/ref-17-least-squares.html
// http://textbooks.math.gatech.edu/ila/least-squares.html

export class StatApp extends App {
    dotRenderer: DotRenderer3;
    lineRenderer: LineRenderer;
    meshRenderer: SimpleMeshRenderer;

    camera: Camera;

    obj?: Renderable;
    dots: Vector3[] = [];
    renderable?: LineArray;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;

        this.dotRenderer = new DotRenderer3(gl, 4, [0, 0, 1, 1], false);
        this.lineRenderer = new LineRenderer(gl, [0, 0, 1, 0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0, 0, 1, 0.25]);
        this.camera = new Camera(canvas);
    }

    start() {
        let a = FloatMatrix.fromNative([
            [22, 10, 2, 3, 7],
            [14, 7, 10, 0, 8],
            [-1, 13, -1, -11, 3],
            [-3, -2, 13, -2, 4],
            [9, 8, 1, -2, 4],
            [9, 1, -7, 5, -1],
            [2, -6, 6, 5, 1],
            [4, 5, 0, -2, 2],
        ]);

        let data = Stat.svd(a);
        console.log(data);
        console.log(Math.sqrt(1248), 20, Math.sqrt(384), 0, 0);
    }

    update(state: InputState) {
        // move the camera with the mouse
        this.camera.update(state);
    }

    draw(gl: WebGLRenderingContext) {
        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;
    }
}
