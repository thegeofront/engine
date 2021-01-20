// obj-loader-app.ts
//
// author : Jos Feenstra
// purpose : drag an obj to the canvas, and view it on the web

import { version_converter } from "@tensorflow/tfjs";
import { Mesh, meshFromObj } from "../geo/mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../input/domwrappers";
import { Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";


export class ObjLoaderApp extends App {
    
    dotRenderer: DotRenderer3;
    lineRenderer: SimpleLineRenderer;
    meshRenderer: SimpleMeshRenderer;
    camera: Camera;
    obj?: Mesh;
    gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super();
        this.gl = gl; // this is bad practice, but i need it during procesFiles
        this.dotRenderer = new DotRenderer3(gl, 2, [1,0,0,1], false);
        this.lineRenderer = new SimpleLineRenderer(gl, [0,0,1,0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.camera = new Camera(canvas);

        addDropFileEventListeners(document, processFiles.bind(this));
    }

    start() {

    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.updateWithControls(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getRenderToScreenMatrix(canvas);

     
        if (this.obj == undefined)
            this.dotRenderer.render(gl, matrix, [new Vector3(0,0,0), new Vector3(1,1,1)]);
        else {
            this.dotRenderer.renderQuick(gl, matrix, this.obj!.verts.data);
            this.meshRenderer.render(gl, matrix);
            this.lineRenderer.render(gl, matrix);
        }    
    }
}

async function processFiles(this: ObjLoaderApp, files: FileList) {
    
    console.log(files);

    // assume its 1 file, the obj file.
    let file = files[0];

    // see if we can build an correct obj from the files
    let objtext = await loadTextFromFile(file);
    this.obj = meshFromObj(objtext);

    // scale down if too big

    this.meshRenderer.set(this.gl, this.obj.verts, this.obj.faces);
    this.lineRenderer.set(this.gl, this.obj.verts, this.obj.getLineIds());
}