// debug-app
// author: Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { version_converter } from "@tensorflow/tfjs";
import { Mesh, meshFromObj } from "../geo/mesh";
import { GeonImage } from "../img/Image";
import { BellusScanData } from "../sfered/bellus-data";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Vector2Array, Vector3Array } from "../math/array";
import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";

const settings = require('../process/settings.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

export class DebugApp extends App {
    
    // context
    gl: WebGLRenderingContext;
    
    // data 
    bsd?: BellusScanData;

    // rendering 
    dotRenderer: DotRenderer3;
    redDotRenderer: DotRenderer3;
    redLineRenderer: SimpleLineRenderer;
    lineRenderer: SimpleLineRenderer;
    meshRenderer: SimpleMeshRenderer;
    camera: Camera;
    

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, context: HTMLDivElement) {
        
        super();
        this.gl = gl; // this is bad practice, but i need it during procesFiles
        this.dotRenderer = new DotRenderer3(gl, 4, [0,0,1,1], false);
        this.redDotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.lineRenderer = new SimpleLineRenderer(gl, [0,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [1,0,0,0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.camera = new Camera(canvas, 3);

        addDropFileEventListeners(document, processFiles.bind(this));
    }

    start() {
        // nothing
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.updateWithControls(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getRenderToScreenMatrix(canvas);

     
        if (this.bsd?.mesh == undefined)
            this.redDotRenderer.render(gl, matrix, [new Vector3(0,0,0), new Vector3(1,1,1)]);
        else {
            let mesh = this.bsd?.mesh;
            let landmarks2 = this.bsd?.landmarks2;
            let landmarks3 = this.bsd!.landmarks3;

            this.redLineRenderer.render(gl, matrix);

            // this.dotRenderer.renderQuick(gl, matrix, landmarks3.data, 3);
            // this.dotRenderer.renderQuick(gl, matrix, mesh.verts.data, 3);
            // this.meshRenderer.render(gl, matrix);
            // this.lineRenderer.render(gl, matrix);

            // this.redDotRenderer.renderQuick(gl, matrix, landmarks2.data, 2);
            // this.redDotRenderer.renderQuick(gl, matrix, landmarks3.data, 3);
        }    
    }

    addBellusData(bsd: BellusScanData) {

        this.bsd = bsd;
        let image = GeonImage.fromImageData(bsd.texture);

        // put the data into the render buffers.
        let mesh = this.bsd?.mesh;
        // this.meshRenderer.set(this.gl, mesh.verts, mesh.faces);
        // this.lineRenderer.set(this.gl, mesh.verts.data, mesh.getLineIds(), 3);
        this.redLineRenderer.set(this.gl, mesh.uvs.data, mesh.getLineIds(), 2);
    }
}

async function processFiles(this: DebugApp, files: FileList) {

    BellusScanData.fromFileList(files, settings).then(
        (bsd) => this.addBellusData(bsd)
    );
}