import { Bezier } from "../../../src/geo/curve/bezier";
import { Loft } from "../../../src/geo/srf/loft";
import {
    App,
    DotRenderer3,
    LineRenderer,
    Camera,
    Vector3,
    MultiLine,
    InputState,
    Parameter,
    MultiVector3,
    DrawSpeed,
    Plane,
    Context,
    UI,
    Circle3,
    Mesh,
    Polyline,
} from "../../../src/lib";

export class SplineApp extends App {
    // ui
    params: Parameter[] = [];

    // state
    dots: Vector3[];
    lines: MultiLine[];

    // render
    camera: Camera;
    drRed: DotRenderer3;
    lrGrid: LineRenderer;
    lrRed: LineRenderer;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, -2, true);
        this.camera.set(-10, 1, 1);

        this.dots = [];
        this.lines = [];

        this.drRed = new DotRenderer3(gl, 10, [1, 0, 0, 1], false);
        this.lrRed = new LineRenderer(gl, [1, 0, 0, 1]);
        this.lrGrid = new LineRenderer(gl, [0.3, 0.3, 0.3, 1]);
    }

    ui(ui: UI) {
        this.params.push(Parameter.new("t", 0, 0, 1, 0.001));
        this.params.push(Parameter.new("u", 0.5, 0, 1, 0.001));
        this.params.push(Parameter.new("v", 0.5, 0, 1, 0.001));

        for (let param of this.params) {
            ui.addParameter(param, this.start.bind(this));
        }
    }

    start() {
        this.startGrid();
        this.dots = [];

        let curve1 = Polyline.new([
            Vector3.new(3, -1, 3),
            Vector3.new(1, -1, 3),
            Vector3.new(1, 1, 3),
            Vector3.new(-1, 1, 3),
        ]);
        let curve2 = Bezier.new([
            Vector3.new(3, -1, 0),
            Vector3.new(1, -1, 0),
            Vector3.new(1, 1, 0),
            Vector3.new(-1, 1, 0),
        ])!;

        let loft = Loft.new([curve1, curve2]);

        let t = this.params[0].get();
        let u = this.params[1].get();
        let v = this.params[2].get();

        this.dots.push(curve1.eval(t));
        this.dots.push(curve2.eval(t));
        this.dots.push(loft.eval(u, v));

        this.lines = [];
        this.lines.push(curve1.buffer());
        this.lines.push(curve2.buffer(100));
        // for (let dot of this.dots) {
        //     this.lines.push(Circle3.newPlanar(dot, 0.1).buffer());
        // }
    }

    startGrid() {
        let grid = MultiLine.fromGrid(Plane.WorldXY(), 100, 2);
        this.lrGrid.set(grid, DrawSpeed.StaticDraw);
    }

    update(state: InputState) {
        this.camera.update(state);
    }

    draw(gl: WebGLRenderingContext) {
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;
        let c = new Context(this.camera);

        this.drRed.setAndRender(this.dots, c);
        this.lrRed.setAndRender(MultiLine.fromJoin(this.lines), c);
        this.lrGrid.render(c);
    }
}
