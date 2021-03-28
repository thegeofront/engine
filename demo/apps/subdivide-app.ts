// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { App, Camera, ShadedMeshRenderer, Parameter, Graph, Renderable, Vector3, 
    UI, InputState, Matrix4, DrawSpeed, Mesh, Cube, Plane, Domain3 } from "../../src/lib";



export class SubdivideApp extends App {

    camera: Camera;
    meshRend: ShadedMeshRenderer;
    
    rotate!: Parameter;
    inner!: Parameter;
    radius = 0.1; // radius!: Parameter;
    detail = 6; // detail!: Parameter;

    graph!: Graph;
    rend!: Renderable;


    constructor(gl: WebGLRenderingContext) {
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.meshRend = new ShadedMeshRenderer(gl);
    }


    ui(ui: UI) {
        this.rotate = new Parameter("rotate", 1, 0, 1, 1)
  
        let reset = () => {
            // this.rotate.set(0);
            this.start();
        }

        ui.addBooleanParameter(this.rotate);
    }
     
    
    start() {

        let graph = new Graph();

        graph.addEdgeIfNew(0, 1);
        graph.addEdgeIfNew(0, 2);
        graph.addEdgeIfNew(1, 2);
        graph.addEdgeIfNew(0, 3);
        graph.addEdgeIfNew(2, 3);
        graph.addEdgeIfNew(1, 3);

        graph.addEdgeIfNew(1, 4);
        graph.addEdgeIfNew(2, 4);
        graph.addEdgeIfNew(3, 4);

        this.graph = graph;
        this.graph.print();
        this.rend = this.graph.toMesh().toRenderable();
        this.rend.calculateFaceNormals();
        this.meshRend.set(this.gl, this.rend);

        // console.log("all loops: ", this.graph.allLoops());
    }


    update(state: InputState) {
        this.camera.update(state);

        if (!state.mouseRightDown && this.rotate.get() == 1) {
            let alpha = 0.0002 * state.tick;
            let rot = Matrix4.newXRotation(alpha)
                .multiply(Matrix4.newYRotation(alpha));
            this.rend!.transform(rot);
            this.meshRend.set(this.gl, this.rend, DrawSpeed.DynamicDraw);
        }
    }


    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.meshRend.render(gl, this.camera);
    }
}