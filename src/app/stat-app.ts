// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { Mesh, meshFromObj } from "../geo/mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";
import { DrawSpeed } from "../render/renderer";
import { Vector3Array } from "../data/vector-array";
import { LineArray } from "../data/line-array";
import { FloatMatrix } from "../data/float-matrix";
import { Stat } from "../math/statistics";

export class StatApp extends App {

    dotRenderer: DotRenderer3;
    lineRenderer: SimpleLineRenderer;
    meshRenderer: SimpleMeshRenderer;

    camera: Camera;

    obj?: Mesh;
    dots: Vector3[] = [];
    renderable?: LineArray;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super(gl);
        this.dotRenderer = new DotRenderer3(gl, 4, [0,0,1,1], false);
        this.lineRenderer = new SimpleLineRenderer(gl, [0,0,1,0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.camera = new Camera(canvas);
    }

    start() {
        // test things
        let a = FloatMatrix.fromNative([
            [22.,10., 2.,  3., 7.],
            [14., 7.,10.,  0., 8.],
            [-1.,13.,-1.,-11., 3.],
            [-3.,-2.,13., -2., 4.],
            [ 9., 8., 1., -2., 4.],
            [ 9., 1.,-7.,  5.,-1.],
            [ 2.,-6., 6.,  5., 1.],
            [ 4., 5., 0., -2., 2.]
        ]);

        let data = Stat.svd(a); 
        console.log(data);
        console.log(Math.sqrt(1248.),20.,Math.sqrt(384.),0.,0.);
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getTotalMatrix();



    }
}
