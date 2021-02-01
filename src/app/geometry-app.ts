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
import { Plane } from "../geo/plane";

export class GeometryApp extends App {

    dotRenderer: DotRenderer3;
    whiteLineRenderer: SimpleLineRenderer;
    greyLineRenderer: SimpleLineRenderer;
    meshRenderer: SimpleMeshRenderer;

    camera: Camera;

    obj?: Mesh;
    dots: Vector3[] = [];
    renderable?: LineArray;

    plane: Plane = Plane.WorldXZ();
    gridLarge!: LineArray;
    gridSmall!: LineArray;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super(gl);
        this.dotRenderer = new DotRenderer3(gl, 4, [0,0,1,1], false);
        this.whiteLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,1]);
        this.greyLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.camera = new Camera(canvas);
    }

    start() {
        let size = 100;
        this.gridLarge = LineArray.fromGrid(this.plane, size, 1);
        this.gridSmall = LineArray.fromGrid(this.plane, (size*10)-1, 0.1);
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.updateWithControls(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getRenderToScreenMatrix(canvas);

        this.whiteLineRenderer.setAndRender(gl, matrix, this.gridLarge);
        this.greyLineRenderer.setAndRender(gl, matrix, this.gridSmall);
    }
}
