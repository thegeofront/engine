// Name:    render-context.ts
// Author:  Jos Feenstra     
// Purpose: Experiment: a collection of renderers, things to render, and Camera's     
// NOTE:    Implement this correctly later, this is just a sketch for now

import { LineArray } from "../mesh/line-array";
import { Plane } from "../geo/plane";
import { RenderMesh } from "../mesh/render-mesh";
import { InputState } from "../system/input-state";
import { SliderParameter } from "../system/ui";
import { Camera } from "./camera";
import { DotRenderer3 } from "./dot-renderer3";
import { MeshRenderer } from "./mesh-renderer";
import { SimpleLineRenderer } from "./simple-line-renderer";


export class RenderContext {

    // renderinfo
    camera: Camera;
    dotRenderer: DotRenderer3;
    lineRenderer: SimpleLineRenderer;
    meshRenderer: MeshRenderer;

    // geo data
    plane: Plane = Plane.WorldXY();
    grid?: LineArray;
    geo: RenderMesh[] = [];

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {

        // TODO abstract this to scene
        this.camera = new Camera(canvas);
        this.camera.z_offset = -10;
        this.camera.angleAlpha = 0.4;
        this.camera.angleBeta = 0.5;
        
        this.dotRenderer = new DotRenderer3(gl, 4, [0,1,0,1]);
        this.meshRenderer = new MeshRenderer(gl, [0,0,1,1], [1,1,0.5,0]);
        this.lineRenderer = new SimpleLineRenderer(gl);
    }

    
    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }
    

    draw(gl: WebGLRenderingContext) {
        // TODO abstract this to 'scene'
        let matrix = this.camera.getTotalMatrix();

        this.dotRenderer.render(gl, matrix);
        this.meshRenderer.render(gl, matrix);
        // this.lineRenderer.render(gl, matrix);
    }
}