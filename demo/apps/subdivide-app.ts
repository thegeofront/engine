// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { App, Camera, ShadedMeshRenderer, Parameter, Graph, RenderMesh, Vector3, UI, InputState, Matrix4, DrawSpeed, Mesh, Cube, Plane, Domain3 } from "../../src/lib";



export class SubdivideApp extends App {

    camera: Camera;
    meshRend: ShadedMeshRenderer;
    
    rotate!: Parameter;
    inner!: Parameter;
    radius = 0.1; // radius!: Parameter;
    detail = 6; // detail!: Parameter;

    graph!: Graph;
    mesh!: RenderMesh;

    constructor(gl: WebGLRenderingContext) {
        
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.meshRend = new ShadedMeshRenderer(gl);
    }

    ui(ui: UI) {

    }
        
    start() {
        this.graph = Mesh.fromCube(Cube.new(Plane.WorldXY(), Domain3.fromRadius(1))).toGraph();
        this.graph.print();
        this.mesh = this.graph.toMesh().toDisplayMesh();
        this.meshRend.set(this.gl, this.mesh);

        // console.log("all loops: ", this.graph.allLoops());
    }

    update(state: InputState) {
        this.camera.update(state);

        if (!state.mouseRightDown && this.rotate.get() == 1) {
            let alpha = 0.0002 * state.tick;
            let rot = Matrix4.newXRotation(alpha)
                .multiply(Matrix4.newYRotation(alpha));
            this.mesh!.transform(rot);
            this.meshRend.set(this.gl, this.mesh, DrawSpeed.DynamicDraw);
        }
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.meshRend.render(gl, this.camera);
    }
}