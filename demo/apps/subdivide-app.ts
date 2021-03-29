// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { App, Camera, ShadedMeshRenderer, Parameter, Graph, Renderable, Vector3, 
    UI, InputState, Matrix4, DrawSpeed, Mesh, Cube, Plane, Domain3, MeshDebugRenderer } from "../../src/lib";
import { Stopwatch } from "../../src/system/stopwatch";
import { graphToMultiMesh } from "./icosahedron-app";



export class SubdivideApp extends App {

    camera: Camera;
    meshRend: ShadedMeshRenderer;
    debugRend: MeshDebugRenderer;

    rotate!: Parameter;
    inner!: Parameter;
    subCount!: Parameter;
    liftType!: Parameter;
    shape!: Parameter;
    
    radius = 0.1; // radius!: Parameter;
    detail = 6; // detail!: Parameter;

    graph!: Graph;
    rend!: Renderable;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.meshRend = new ShadedMeshRenderer(gl);
        this.debugRend = new MeshDebugRenderer(gl, [0.5,0,0,1], [1,0,0,1], true);
    }


    ui(ui: UI) {
        let reset = () => {
            // this.rotate.set(0);
            this.start();
        }
        
        this.rotate = new Parameter("rotate", 1, 0, 1, 1)
        this.shape = new Parameter("shape", 0, 0, 1, 1);
        this.subCount = new Parameter("sub count", 1, 0, 4, 1)
        this.liftType = new Parameter("lift type", 1, 0, 2, 1);
  
        ui.addBooleanParameter(this.rotate);
        ui.addParameter(this.shape, reset);
        ui.addParameter(this.subCount, reset);
        ui.addParameter(this.liftType, reset);
    }
     
    
    start() {
        let shape = this.shape.get();
        let liftType = this.liftType.get();        

        let mesh;
        if (shape == 0) {
            mesh = Mesh.newIcosahedron(2)
        } else {
            mesh = Mesh.fromCube(Cube.new(Plane.WorldXY(), Domain3.fromRadius(2)));
        } 
        let graph = mesh.toGraph();
        
        let center = new Vector3(0,0,0);

        let radius;
        if (liftType == 2) {
            radius = 1;
        } else {
            radius = graph.getVertexPos(0).disTo(center);
        }
        

        // DEBUG: PERFORMANCE
        console.log("lets start subdivisions!");
        let stopwatch = Stopwatch.new();        

        // subdivide 
        for (let i = 0 ; i < this.subCount.get(); i++) {
            graph.subdivide();

            // lift to sphere after every subdivision
            if (liftType > 0) {
                let count = graph.getVertexCount();
                for (let i = 0 ; i < count; i++) {
                    let pos = graph.getVertexPos(i);
                    let normal = graph.getVertexNormal(i);
        
                    let dis = center.disTo(pos);
                    let lift = radius - dis;
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

        this.graph = graph;
        this.rend = this.graph.toRenderable();
        // this.rend.calculateFaceNormals();

        console.log("to renderable in ", stopwatch.time(), "ms");

        
        // graph.allVertLoops();
        // console.log("allVertLoops in ", stopwatch.time(), "ms");

        // this.meshRend.set(this.gl, graphToMultiMesh(this.graph, 0.05, 6, false, true));
        this.debugRend.set(this.gl, this.rend);
        // console.log("edges: ", this.graph.allEdges());
        // console.log("loops: ", this.graph.allVertLoops());

    }


    update(state: InputState) {
        this.camera.update(state);

        if (!state.mouseRightDown && this.rotate.get() == 1) {
            let alpha = 0.0002 * state.tick;
            let rot = Matrix4.newXRotation(alpha)
                .multiply(Matrix4.newYRotation(alpha));
            this.rend!.transform(rot);
            this.debugRend.set(this.gl, this.rend, DrawSpeed.DynamicDraw);
        }
    }


    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        // this.meshRend.render(gl, this.camera);
        this.debugRend.render(gl, this.camera);
    }
}