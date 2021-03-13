// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: drag an obj to the canvas, and view it on the web

import { RenderMesh, meshFromObj } from "../mesh/render-mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { LineRenderer } from "../render/line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";
import { DrawSpeed } from "../render/renderer";
import { Vector3Array } from "../data/vector-array";
import { LineArray } from "../mesh/line-array";


export class ObjLoaderApp extends App {
    
    dotRenderer: DotRenderer3;
    lineRenderer: LineRenderer;
    meshRenderer: SimpleMeshRenderer;
    camera: Camera;
    obj?: RenderMesh;
    renderable?: LineArray;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super(gl);
        this.dotRenderer = new DotRenderer3(gl, 4, [0,0,1,1], false);
        this.lineRenderer = new LineRenderer(gl, [0,0,1,0.5]);
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.camera = new Camera(canvas);

        addDropFileEventListeners(canvas, processFiles.bind(this));
    }

    start() {
        // nothing
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.totalMatrix;

     
        if (this.obj == undefined)
            this.dotRenderer.setAndRender(gl, matrix, Vector3Array.fromList([new Vector3(0,0,0), new Vector3(1,1,1)]));
        else {
            this.dotRenderer.setAndRender(gl, matrix, this.obj!.verts);
            // this.meshRenderer.render(gl, matrix);
            this.lineRenderer.render(gl, matrix);
        }    
    }
}

async function processFiles(this: ObjLoaderApp, files: FileList) {

    // assume its 1 file, the obj file.
    let file = files[0];

    // see if we can build an correct obj from the files
    let objtext = await loadTextFromFile(file);
    this.obj = meshFromObj(objtext);
    this.renderable = LineArray.fromMesh(this.obj);

    // scale down if too big.
    // NOTE: this could also be done using matrices. Figure that out!
    console.log("scaling...");

    let bounds = Domain3.fromInclude(this.obj.verts);
    let factor = 1 / bounds.size().largestValue();
    
    // TODO : one line these types of operations? 
    // they will be quite common i think...
    let count = this.obj.verts.count();
    for(let i = 0 ; i < count; i++) {
        let vec = this.obj.verts.getVector(i)
        vec.scale(factor);
        this.obj.verts.setVector(i, vec);
    }
    
    
    // let objBounds = Domain3.fromInclude(this.obj.verts);
    // console.log(objBounds);

    // let factor = 100;
    // let smaller = Domain3.fromRadii(
    //     objBounds.x.size() / factor,
    //     objBounds.y.size() / factor,
    //     objBounds.z.size() / factor,
    // );
    // this.obj.verts = objBounds.remapAll(this.obj.verts, smaller);
    console.log("done!");

    // put the data into the render buffers.
    // this.meshRenderer.set(this.gl, this.obj.verts, this.obj.faces);
    this.lineRenderer.set(this.gl, this.renderable, DrawSpeed.StaticDraw);
}