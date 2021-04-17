// TODO
// - improve quadification: less triangles!
// - improve squarification: speed & equal sizes

import {
    App,
    Camera,
    ShadedMeshRenderer,
    Parameter,
    Graph,
    Renderable,
    Vector3,
    UI,
    InputState,
    Matrix4,
    DrawSpeed,
    Mesh,
    Cube,
    Plane,
    Domain3,
    MeshDebugRenderer,
    VertIndex,
    EdgeIndex,
    EnumParameter,
    GraphDebugRenderer,
} from "../../src/lib";

import { Stopwatch } from "../../src/system/stopwatch";
import { constructRenderableFromSphereGraph } from "../functions/spherical-function";
import { graphToMultiMesh } from "./icosahedron-app";
import {
    averageEdgeLength,
    laPlacian,
    quadification,
    squarification,
} from "../functions/spherical-function";

//
//
//
export class SphericalThreeApp extends App {
    camera: Camera;
    meshRend: ShadedMeshRenderer;
    debugRend: MeshDebugRenderer;
    graphRend: GraphDebugRenderer;

    rotate!: Parameter;
    inner!: Parameter;
    subCount!: Parameter;
    quadSubCount!: Parameter;
    liftType!: EnumParameter;
    randomEdges!: Parameter;

    radius = 0.1;

    graph!: Graph;
    rend!: Renderable;
    average!: number;
    smooth!: Parameter;
    smoothlimit = 0;
    cca?: number;

    world!: Renderable;

    constructor(gl: WebGLRenderingContext) {
        super(gl, "Multiple Layers of spherical geometry");

        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 1, true);
        this.meshRend = new ShadedMeshRenderer(gl);
        // this.meshRend = new MeshDebugRenderer(gl, [0, 0, 0, 1], [0.3, 0.3, 0.3, 1], false);
        this.debugRend = new MeshDebugRenderer(gl, [0.5, 0, 0, 1], [0, 0, 0, 1], false);
        this.graphRend = new GraphDebugRenderer(gl, [0.5, 0.5, 0.5, 1], [1, 1, 1, 1]);
    }

    ui(ui: UI) {
        let reset = () => {
            // this.rotate.set(0);
            this.start();
        };

        this.rotate = new Parameter("rotate", 1, 0, 1, 1);
        this.randomEdges = new Parameter("randomEdges", 1, 0, 1, 1);
        this.smooth = new Parameter("smooth", 0, 0, 1, 1);
        this.subCount = new Parameter("sub count", 2, 0, 4, 1);
        this.quadSubCount = new Parameter("sub count quad", 1, 0, 2, 1);
        this.liftType = EnumParameter.new("lift type", 1, ["none", "sphere", "buggy"]);

        ui.addBooleanParameter(this.rotate);
        ui.addBooleanParameter(this.randomEdges, reset);
        ui.addBooleanParameter(this.smooth);
        ui.addParameter(this.subCount, reset);
        ui.addParameter(this.quadSubCount, reset);
        ui.addParameter(this.liftType, reset);
        ui.addButton("recalculate", reset);
    }

    start() {
        let liftType = this.liftType.get();

        // 0 | setup
        const mesh = Mesh.newIcosahedron(0.5);
        let graph = mesh.toGraph();
        let center = new Vector3(0, 0, 0);
        this.smoothlimit = 0;

        if (liftType == 2) {
            this.radius = 1;
        } else {
            this.radius = graph.getVertexPos(0).disTo(center);
        }

        // 1 | subdivide
        for (let i = 0; i < this.subCount.get(); i++) {
            graph.subdivide();

            // lift to sphere after every subdivision
            if (liftType > 0) {
                let count = graph.getVertexCount();
                for (let i = 0; i < count; i++) {
                    let pos = graph.getVertexPos(i);
                    let normal = pos;

                    let dis = center.disTo(pos);
                    let lift = this.radius - dis;
                    if (liftType > 1) {
                        pos.add(normal.scaled(lift));
                    } else {
                        pos.add(normal.normalized().scaled(lift));
                    }
                }
            }
        }

        // 2 | remove random edges
        if (this.randomEdges.get() == 1) {
            quadification(graph);
        }

        // 3 | subdivide quad
        for (let i = 0; i < this.quadSubCount.get(); i++) {
            graph.subdivideQuad();
        }

        // lift to sphere after every subdivision
        if (liftType > 0) {
            let count = graph.getVertexCount();
            for (let i = 0; i < count; i++) {
                let pos = graph.getVertexPos(i);
                let normal = graph.getVertexNormal(i);

                let dis = center.disTo(pos);
                let lift = this.radius - dis;
                if (liftType > 1) {
                    pos.add(normal.scaled(lift));
                } else {
                    pos.add(normal.normalized().scaled(lift));
                }
            }
        }

        // 4 | quad relaxation
        this.graph = graph;

        // 5 | convert
        this.graphRend.set(this.graph, DrawSpeed.DynamicDraw);
        this.average = averageEdgeLength(this.graph);

        this.bufferWorld();
    }

    bufferWorld() {
        this.world = constructRenderableFromSphereGraph(this.graph, this.radius, 0, 0.1, 0.6);
        this.world.calculateFaceNormals();
    }

    update(state: InputState) {
        this.camera.update(state);

        let pulse = Math.sin(state.newTime);

        // sucessive over relaxation
        if (this.smooth.get() == 1) {
            if (this.smoothlimit < 1000) {
                // squarification smoother

                this.cca = squarification(this.graph, this.cca);
                // this.cca = this.squarification(this.graph);
                // console.log(this.cca);
                laPlacian(this.graph);

                // project back to sphere
                this.graph.verts.forEach((v) => {
                    let normal = v.pos;
                    let lift = this.radius - v.pos.length();
                    v.pos.add(normal.normalized().scaled(lift));
                });
                this.smoothlimit += 1;
                this.bufferWorld();
            }
        } else {
            this.smoothlimit = 0;
        }

        this.graphRend.set(this.graph, DrawSpeed.DynamicDraw);
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);

        this.meshRend.set(this.gl, this.world, DrawSpeed.DynamicDraw);
        this.meshRend.render(gl, this.camera);

        // this.graphRend.render(gl, this.camera);
    }
}
