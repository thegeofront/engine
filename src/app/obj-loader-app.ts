// obj-loader-app.ts
//
// author : Jos Feenstra
// purpose : drag an obj to the canvas, and view it on the web

import { Mesh } from "../geo/Mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../input/domwrappers";
import { Vector3 } from "../math/Vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { InputState } from "../system/InputState";
import { App } from "./app";


export class ObjLoaderApp extends App {
    
    dotRenderer: DotRenderer3;
    camera: Camera;
    obj?: Mesh;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super();

        this.dotRenderer = new DotRenderer3(gl, 5, [1,0,0,1], false);
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
        else
            this.dotRenderer.renderQuick(gl, matrix, this.obj!.verts.data);
    }
}

async function processFiles(this: ObjLoaderApp, files: FileList) {
    
    console.log(files);

    // assume its 1 file, the obj file.
    let file = files[0];

    // see if we can build an correct obj from the files
    let objtext = await loadTextFromFile(file);
    this.obj = await Mesh.fromObj(objtext);
}