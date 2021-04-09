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
} from "../../src/lib";

import { GraphDebugRenderer } from "../../src/render/graph-debug-renderer";
import { Stopwatch } from "../../src/system/stopwatch";
import { graphToMultiMesh } from "./icosahedron-app";

export class StalbergApp extends App {
    description =
        "Setup for trying out different partitions of a sphere." +
        "Based on Oskar Stalberg's irregular quad grid";

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

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 1, true);
        this.meshRend = new ShadedMeshRenderer(gl);
        this.debugRend = new MeshDebugRenderer(gl, [0.5, 0, 0, 1], [1, 0, 0, 1], false);
        this.graphRend = new GraphDebugRenderer(gl, [0.5, 0, 0, 1], [1, 0, 0, 1]);
    }

    ui(ui: UI) {
        let reset = () => {
            // this.rotate.set(0);
            this.start();
        };

        this.rotate = new Parameter("rotate", 0, 0, 1, 1);
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

        // DEBUG: PERFORMANCE
        console.log("lets start subdivisions!");
        let stopwatch = Stopwatch.new();

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
                console.log("lift in ", stopwatch.time(), "ms");
            }
        }

        // DEBUG: PERFORMANCE
        console.log("subdivision in ", stopwatch.time(), "ms");

        // 2 | remove random edges
        if (this.randomEdges.get() == 1) {
            quadification(graph);

            // graph.print();
            // 2 | remove random edges
            // let edges = graph.all();
            // let picks: number[] = [];
            // let pickCount = 100;
            // for (let i = 0 ; i < pickCount; i++) {

            //     let p = randomInt(edges.length);
            //     picks.push(edges[p]);
            // }

            // // // console.log(picks);

            // for (let i = 0 ; i < edges.length; i++) {
            //     if (Math.random() > 0.0) {
            //         let ei = edges[i];
            //         let loops = graph.getLoopsAdjacentToEdge(ei);
            //         if (loops[0].length == 3 && loops[1].length == 3) {
            //             graph.deleteEdgeFromIndex(edges[i]);
            //         }
            //     }
            // }
        }

        console.log("edge removal in ", stopwatch.time(), "ms");

        // 3 | subdivide quad
        for (let i = 0; i < this.quadSubCount.get(); i++) {
            graph.subdivideQuad();
        }

        // DEBUG: PERFORMANCE
        console.log("quad subdivision in ", stopwatch.time(), "ms");

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
            console.log("lift in ", stopwatch.time(), "ms");
        }

        // 4 | quad relaxation
        this.graph = graph;

        // this.rend = this.graph.toRenderable();
        // this.rend = graphToMultiMesh(this.graph, 0.02, 3, false, true);
        // this.rend.calculateVertexNormals();
        // console.log("num triangles = ", this.rend.mesh.links.count());
        // console.log("to renderable in ", stopwatch.time(), "ms");

        // this.graph.print();
        // let loops = graph.allVertLoopsAsInts();
        // console.log("allVertLoops in ", stopwatch.time(), "ms");
        //console.log(loops);

        // 5 | convert

        if (liftType == 1) {
            let somesphere = Mesh.newSphere(
                Vector3.zero(),
                this.radius * 0.99,
                6,
                10,
            ).toRenderable();
            somesphere.calculateVertexNormals();
            this.meshRend.set(this.gl, somesphere, DrawSpeed.StaticDraw);
        } else if (liftType == 0) {
            let something = mesh.toRenderable();
            something.transform(Matrix4.newScaler(0.99, 0.99, 0.99));
            something.calculateFaceNormals();
            this.meshRend.set(this.gl, something, DrawSpeed.StaticDraw);
        }

        this.graphRend.set(this.graph, DrawSpeed.DynamicDraw);
        this.average = _averageEdgeLength(this.graph);
        // console.log("edges: ", this.graph.allEdges());
        // console.log("loops: ", this.graph.allVertLoops());
    }

    update(state: InputState) {
        this.camera.update(state);

        if (!state.mouseRightDown && this.rotate.get() == 1) {
            // rotate
            let alpha = 0.0001 * state.tick;
            let rot = Matrix4.newXRotation(alpha).multiply(Matrix4.newYRotation(alpha));
            this.graph.transform(rot);
        }

        // sucessive over relaxation
        if (this.smooth.get() == 1) {
            if (this.smoothlimit < 1000) {
                // squarification smoother

                this.cca = squarification(this.graph, this.cca);
                // this.cca = this.squarification(this.graph);
                // console.log(this.cca);
                _laPlacian(this.graph);

                // project back to sphere
                this.graph.verts.forEach((v) => {
                    let normal = v.pos;
                    let lift = this.radius - v.pos.length();
                    v.pos.add(normal.normalized().scaled(lift));
                });
                this.smoothlimit += 1;
            }
        } else {
            this.smoothlimit = 0;
        }

        this.graphRend.set(this.graph, DrawSpeed.DynamicDraw);
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.meshRend.render(gl, this.camera);
        this.graphRend.render(gl, this.camera);
    }

    // --------------------
}

function _averageEdgeLength(graph: Graph): number {
    let count = 0;
    let sum = 0;
    graph.forEveryEdgeVerts((a, b) => {
        sum += a.disTo(b);
        count += 1;
    });

    let average = sum / count;
    return average;
}

function _edgeSmooth(graph: Graph, average: number, scale: number) {
    graph.forEveryEdgeVerts((a, b) => {
        let distance = a.disTo(b);
        let diff = average - distance;
        let vector = b.subbed(a);
        a.add(vector.scaled(-diff * scale));
        b.add(vector.scaled(diff * scale));
    });
}

function _laPlacian(graph: Graph) {
    let count = graph.getVertexCount();
    let news: Vector3[] = [];

    // get center of nbs
    for (let vi = 0; vi < count; vi++) {
        let v = graph.getVert(vi);
        if (v.dead) continue;

        let sum = Vector3.zero();
        let nbs = graph.getVertNeighbors(vi);
        for (let nb of nbs) {
            sum.add(graph.getVertexPos(nb));
        }
        sum.scale(1 / nbs.length);
        news.push(sum);
    }

    // set
    for (let vi = 0; vi < count; vi++) {
        graph.getVertexPos(vi).copy(news[vi]);
    }
}

function squarification(graph: Graph, centerCornerAverage?: number) {
    // make the quad graph as 'square' as possible

    // prepare
    let faces = graph.allVertLoopsAsInts();
    let count = faces.length;
    let centers = new Array<Vector3>(count);
    let movers = new Array<Vector3>(graph.verts.length);
    let counters = new Array<number>(graph.verts.length);
    for (let i = 0; i < movers.length; i++) {
        movers[i] = Vector3.new(0, 0, 0);
        counters[i] = 0;
    }
    let cca = 0;

    // iterate per face
    for (let i = 0; i < count; i++) {
        // get face, center and corners
        let center = centers[i];
        let face = faces[i];
        let faceCount = face.length;
        if (face.length == 0) {
            throw "HELP, WE ARE NOT DEALING WITH QUADS HERE!";
        }
        center = Vector3.new(0, 0, 0);
        let corners = new Array<Vector3>(faceCount);
        for (let j = 0; j < faceCount; j++) {
            let vi = face[j];
            corners[j] = graph.getVertexPos(vi);
            center.add(corners[j]);
        }
        center.scale(1 / faceCount);

        // now that we have center, calculate cca
        let local_cca = 0;
        for (let j = 0; j < faceCount; j++) {
            local_cca = center.disTo(corners[j]);
        }
        local_cca /= faceCount;
        cca += local_cca;

        // but use the given one if present
        let scaler;
        let cca_diff;

        if (centerCornerAverage) {
            scaler = centerCornerAverage;
            cca_diff = centerCornerAverage - local_cca;
        } else {
            scaler = local_cca;
            cca_diff = 0;
        }

        // rotate all corners into the same space, and get the average of that
        // TODO SAVE TIME BY DOING THIS:
        // new Vector2(v.dot(ihat), v.dot(jhat)).angle()

        let plane = Plane.from3pt(center, corners[0], corners[1]);
        let normedCorners = new Array<Vector3>(face.length);
        let normedCenter = Vector3.new(0, 0, 0);
        let delta = 2 / faceCount;
        for (let j = 0; j < faceCount; j++) {
            normedCorners[j] = plane.rotateVector(corners[j], j * Math.PI * delta);
            normedCenter.add(normedCorners[j]);
        }

        // scale this averaged to the center corner average
        normedCenter.scale(1 / 4);
        let normal = normedCenter.subbed(center).normalize();
        let perfectCorner = center.added(normal.scaled(local_cca));

        // increate gunfactor if square is very small (awww)
        let gunfactor = 1;
        let equalizer = 200;
        gunfactor += Math.max(-1 * cca_diff * equalizer, 0);

        // console.log(gunfactor);

        // rotate this average back, and add it to the movers of every vertex
        for (let j = 0; j < faceCount; j++) {
            let vi = face[j];
            let v = plane.rotateVector(perfectCorner, j * Math.PI * delta);
            movers[vi].add(v.scaled(gunfactor));
            counters[vi] += 1;
        }
    }

    // now, move the graph
    for (let i = 0; i < movers.length; i++) {
        let mover = movers[i];
        let counter = counters[i];
        if (counter < 1) {
            continue;
        }
        let v = graph.getVertexPos(i);
        v.add(mover.scale(1 / counter));
    }

    // return the center corner average, to be used in the next cycle
    cca /= count;
    return cca;
}

function quadification(graph: Graph) {
    // edge deletion heuristic:
    // remove edges between two triangles to create a quad.
    // keep removing edges until no triangle neighbors another triangle.

    // prepare
    let count = graph.edges.length;
    let edgeIds = new Array<EdgeIndex>(count);
    let visited = new Array<boolean>(count);

    graph.edges.forEach((e, i) => {
        edgeIds[i] = i;
        visited[i] = false;
    });

    // shuffle
    let shuffler = (a: any, b: any) => {
        return 0.5 - Math.random();
    };
    edgeIds.sort(shuffler);

    // per edge
    for (let i = 0; i < count; i++) {
        let ei = edgeIds[i];
        let e = graph.edges[ei];
        if (e.dead || visited[ei]) {
            continue;
        }

        let loops = graph.getLoopsAdjacentToEdge(ei);

        // only delete edges between triangles

        if (loops[0].length > 3 || loops[1].length > 3) {
            continue;
        }

        // the edges of this new quad should not be touched!
        for (let loop of loops) {
            for (let edgeIndex of loop) {
                visited[edgeIndex] = true;
            }
        }

        // now remove this edge itself
        graph.deleteEdgeByIndex(ei);
    }
}

function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}
