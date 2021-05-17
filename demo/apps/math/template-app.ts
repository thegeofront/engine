import {
    App,
    DotRenderer3,
    LineRenderer,
    Camera,
    Vector3,
    LineArray,
    InputState,
    Parameter,
    Vector3Array,
    DrawSpeed,
    Plane,
    Context,
    UI,
} from "../../../src/lib";

export class TemplateApp extends App {
    // ui
    params: Parameter[] = [];

    // state
    points!: Vector3Array;
    Plsa!: Vector3Array;
    Pnormal!: Vector3Array;

    // render
    camera: Camera;
    drRed: DotRenderer3;
    gridRenderer: LineRenderer;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, -2, true);
        this.camera.set(-2, 1, 1);

        this.drRed = new DotRenderer3(gl, 10, [1, 0, 0, 1], false);
        this.gridRenderer = new LineRenderer(gl, [0.3, 0.3, 0.3, 1]);
    }

    start() {
        this.startGrid();
    }

    ui(ui: UI) {}

    startGrid() {
        let grid = LineArray.fromGrid(Plane.WorldXY().moveTo(new Vector3(0, 0, -1)), 100, 2);
        this.gridRenderer.set(grid, DrawSpeed.StaticDraw);
    }

    update(state: InputState) {
        this.camera.update(state);
    }

    draw(gl: WebGLRenderingContext) {
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;
        let c = new Context(this.camera);
        this.gridRenderer.render(c);
    }
}
