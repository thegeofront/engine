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
    UI,
    Parameter,
    Vector3Array,
    Domain3,
    Matrix4,
    DrawSpeed,
    Plane,
    Matrix3,
    Context,
} from "../../../src/lib";

// good sites explaining the power of least squares
// https://courses.physics.illinois.edu/cs357/sp2020/notes/ref-17-least-squares.html
// http://textbooks.math.gatech.edu/ila/least-squares.html

export class LeastSquaresApp extends App {
    // ui
    params: Parameter[] = [];

    // state
    points!: Vector3Array;
    Plsa!: Vector3Array;
    Pnormal!: Vector3Array;

    // render
    camera: Camera;
    drRed: DotRenderer3;
    drBlue: DotRenderer3;
    lineRenderer: LineRenderer;
    count = 2;
    drGreen: DotRenderer3;

    constructor(gl: WebGLRenderingContext) {
        super(gl);

        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, -2, true);

        this.drRed = new DotRenderer3(gl, 10, [1, 0, 0, 1], false);
        this.drGreen = new DotRenderer3(gl, 10, [0, 1, 0, 1], false);
        this.drBlue = new DotRenderer3(gl, 10, [0, 0, 1, 1], false);
        this.lineRenderer = new LineRenderer(gl, [0.3, 0.3, 0.3, 1]);

        this.points = createRandomPoints(16, 1);

        this.resetCamera();
    }

    ui(ui: UI) {
        const factor = 5;
        this.params.push(new Parameter("x", 0, -factor, factor, 0.1));
        this.params.push(new Parameter("y", 0, -factor, factor, 0.1));
        this.params.push(new Parameter("z", 0, -factor, factor, 0.1));

        const two_pi = 3.1415 * 2;
        const piPart = (two_pi * 2) / 100;
        this.params.push(new Parameter("a", 0.0, -two_pi, two_pi, piPart));
        this.params.push(new Parameter("b", 0.0, -two_pi, two_pi, piPart));
        this.params.push(new Parameter("g", 0.0, -two_pi, two_pi, piPart));

        this.params.push(new Parameter("sx", 1, -factor, factor, 0.1));
        this.params.push(new Parameter("sy", 1, -factor, factor, 0.1));
        this.params.push(new Parameter("sz", 1, -factor, factor, 0.1));

        this.params.push(new Parameter("noise", 0, 0, 1, 0.01));

        this.params.push(Parameter.newBoolean("realtime", true));

        this.params.push(new Parameter("point count", 16, 1, 100, 1));

        let p = this.params;

        let recalc = () => {
            if (this.params[10].state == 1) {
                this.start();
            }
        };

        ui.addText(
            "Using least squares adjustment & singular value decomposition to solve a 3D transformation between points. F12 for more info",
        );

        ui.addText("translate");
        ui.addParameter(p[0], recalc);
        ui.addParameter(p[1], recalc);
        ui.addParameter(p[2], recalc);

        ui.addText("rotate");
        ui.addParameter(p[3], recalc);
        ui.addParameter(p[4], recalc);
        ui.addParameter(p[5], recalc);

        ui.addText("scale");
        ui.addParameter(p[6], recalc);
        ui.addParameter(p[7], recalc);
        ui.addParameter(p[8], recalc);

        ui.addText("");
        ui.addParameter(p[9], recalc);
        ui.addParameter(p[11], () => {
            this.points = createRandomPoints(this.params[11].get(), 1);
            this.start();
        });
        ui.addBooleanParameter(p[10]);

        ui.addButton("recalculate", () => {
            this.start();
        });
    }

    resetCamera() {
        this.camera.z_offset = -10;
        this.camera.angleAlpha = Math.PI * 0.25;
        this.camera.angleBeta = Math.PI * 0.25;
    }

    startGrid() {
        let grid = LineArray.fromGrid(Plane.WorldXY().moveTo(new Vector3(0, 0, -1)), 100, 2);
        this.lineRenderer.set(grid, DrawSpeed.StaticDraw);
    }

    start() {
        console.clear();

        // translate
        let mov = Matrix4.newTranslation(
            this.params[0].get(),
            this.params[1].get(),
            this.params[2].get(),
        );

        // rotate
        let rotx = Matrix4.newXRotation(this.params[3].get());
        let roty = Matrix4.newYRotation(this.params[4].get());
        let rotz = Matrix4.newZRotation(this.params[5].get());
        let rot = rotx.multiplied(roty).multiplied(rotz);

        // scale
        let sca = Matrix4.newScaler(
            this.params[6].get(),
            this.params[7].get(),
            this.params[8].get(),
        );

        // compound
        let M = sca.multiplied(rot.multiplied(mov));

        // transform the points
        this.Pnormal = this.points.clone().transform(M);

        // apply noise
        let noise = createRandomPoints(this.params[11].get(), this.params[9].get());
        this.Pnormal = this.Pnormal.mapWith(noise, (a, b) => {
            return a + b;
        });

        // approximate using least squares adjustment
        let lsa_matrix = leastSquares(this.points, this.Pnormal);
        this.Plsa = this.points.clone().transform(lsa_matrix);

        // show
        console.log("original matrix: (blue)");
        M.print();

        console.log("lsa+svd recovered matrix from nothing but the points: (green)");
        lsa_matrix.print();

        // TODO something is going wrong with setting, so we are using set&render in the draw step every time...
        this.startGrid();
    }

    update(state: InputState) {
        // move the camera with the mouse
        this.camera.update(state);
    }

    draw(gl: WebGLRenderingContext) {
        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;
        let c = new Context(this.camera);

        this.lineRenderer.render(c);
        this.drRed.setAndRender(this.points, c);
        this.drBlue.setAndRender(this.Pnormal, c);
        this.drGreen.setAndRender(this.Plsa, c);
    }
}

function createRandomPoints(count: number, range: number): Vector3Array {
    let bounds = Domain3.fromBounds(-range, range, -range, range, -range, range);
    let arr = new Vector3Array(count);
    for (let i = 0; i < count; i++) {
        arr.setVector(i, bounds.elevate(Vector3.fromRandom()));
    }
    return arr;
}

// solve x for Ax = b, where in this case, A = left, b = right.
function leastSquares(left: Vector3Array, right: Vector3Array): Matrix4 {
    if (left.count() != right.count()) {
        throw "matrices need to be of equal width & height";
    }

    // construct linear system of equations
    let n = left.count();

    let left_width = 4;
    let right_width = 3;

    let height = right_width * n;
    let width = 16;
    let M = new FloatMatrix(height, width);

    // per row in floatmatrix
    for (let f = 0; f < n; f++) {
        let l_vec = [...left.getRow(f), 1];
        let r_vec = [...right.getRow(f), 1];

        // go over x', y', z', 1 on the right side
        for (let part = 0; part < right_width; part++) {
            //
            let i = f * right_width + part;
            let offset = left_width * part;

            // X  Y  Z  1  0  0  0  0 ...
            for (let j = 0; j < l_vec.length; j++) {
                M.set(i, j + offset, l_vec[j]);
            }

            // ... -v*X  -v*Y  -v*Z   -v*1
            offset = width - left_width;
            for (let j = 0; j < l_vec.length; j++) {
                let v = M.get(i, j + offset);
                M.set(i, j + offset, v + -1 * r_vec[part] * l_vec[j]);
            }
        }
    }

    let [U, S, V] = Stat.svd(M);
    let col = V.getColumn(V._width - 1);
    let scaler = 1 / col[15];
    for (let i = 0; i < col.length; i++) {
        col[i] = Math.round(col[i] * scaler * 100000) / 100000;
    }

    // create the actual matrix
    let matrix = Matrix4.new([...col]);
    return matrix.transpose();
}
