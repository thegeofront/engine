import { Bezier } from "../../../src/geo/curve/bezier";
import { BezierSquare } from "../../../src/geo/surface/bezier";
import { Loft } from "../../../src/geo/surface/loft";
import {
    App,
    Parameter,
    Vector3,
    MultiLine,
    Camera,
    DotRenderer3,
    LineRenderer,
    MeshDebugRenderer,
    UI,
    Polyline,
    Plane,
    DrawSpeed,
    InputState,
    Context,
    Domain3,
    Util,
    Domain2,
    MultiVector2,
} from "../../../src/lib";
import { Random } from "../../../src/math/random";

export class SurfaceApp extends App {
    // ui
    params: Parameter[] = [];

    // state
    seed: number;
    dots: Vector3[];
    lines: MultiLine[];

    // render
    camera: Camera;
    drRed: DotRenderer3;
    lrGrid: LineRenderer;
    lrRed: LineRenderer;
    mr: MeshDebugRenderer;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, -2, true);
        this.camera.set(-10, 1, 1);

        this.seed = Random.randomSeed();
        this.dots = [];
        this.lines = [];

        this.drRed = new DotRenderer3(gl, 10, [1, 0, 0, 1], false);
        this.lrRed = new LineRenderer(gl, [1, 0, 0, 1]);
        this.lrGrid = new LineRenderer(gl, [0.3, 0.3, 0.3, 1]);
        this.mr = new MeshDebugRenderer(gl, [1, 0, 0, 0.5], [1, 1, 1, 0.5]);
    }

    ui(ui: UI) {
        ui.addText("BEZIER SQUARE");
        this.params.push(Parameter.new("degree", 3, 2, 6, 1));
        ui.addParameter(this.params[0], this.start.bind(this));
        this.params.push(Parameter.new("displace", 0.5, 0, 1, 0.001));
        ui.addParameter(this.params[1], this.start.bind(this));
        this.params.push(Parameter.new("detail", 10, 2, 100, 1));
        ui.addParameter(this.params[2], this.start.bind(this));
    }

    start() {
        // create a base grid
        this.startGrid();

        // get all parameters
        let degree = this.params[0].get();
        let displace = this.params[1].get();
        let detail = this.params[2].get();

        // create a grid of points
        let rng = Random.fromSeed(this.seed);
        let vecs3 = Array<Vector3>();
        for (let vec2 of Domain2.fromRadius(3).iter(degree + 1, degree + 1)) {
            vecs3.push(vec2.to3D().add(Vector3.fromRandomUnit(rng).scale(displace)));
        }

        // 3 - bisurface
        // let surface = BezierSquare.new()!;

        // dots
        this.dots = [];
        this.dots.push(...vecs3);

        // lines
        this.lines = [];
        // this.lines.push(loft.isoCurveV(u).buffer(detail));
        // for (let dot of this.dots) {
        //     this.lines.push(Circle3.newPlanar(dot, 0.1).buffer());
        // }

        // mesh
        // this.mr.set(loft.buffer(detail, detail).toRenderable());
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
        // this.lrRed.setAndRender(MultiLine.fromJoin(this.lines), c);
        this.lrGrid.render(c);
        // this.mr.render(c);
    }
}
