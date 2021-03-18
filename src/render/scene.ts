// Name:    scene.ts
// Author:  Jos Feenstra     
// Purpose: Experiment: a collection of renderers, things to render, and Camera's, as common as many 3d engines  
// NOTE:    Implement this correctly later, this is just a sketch for now

import { LineArray } from "../mesh/line-array";
import { Plane } from "../geo/plane";
import { RenderMesh } from "../mesh/render-mesh";
import { InputState } from "../system/input-state";
import { Parameter } from "../system/ui";
import { Camera } from "./camera";
import { DotRenderer3 } from "./dot-renderer3";
import { MeshDebugRenderer } from "./mesh-debug-renderer";
import { LineRenderer } from "./line-renderer";
import { Vector3 } from "../math/vector";
import { DrawSpeed, Renderer } from "./renderer";


export class Scene {

    // renderinfo
    camera: Camera;
    lighting: Vector3;
    renderables: (Renderable | null)[];

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {

        // TODO abstract this to scene
        this.camera = new Camera(canvas);
        this.lighting = new Vector3(1,0,0);
        this.renderables = [];
    }


    add(r: Renderable) {
        for (let i = 0 ; i < this.renderables.length; i++) {
            let r = this.renderables[i];
            if (!r) {
                this.renderables[i] = r;
                return;        
            }
        }
        this.renderables.push(r);
    }
    

    remove(r: Renderable) {
        for (let i = 0 ; i < this.renderables.length; i++) {
            let other = this.renderables[i];
            if (r === other) {
                this.renderables[i] = null;
            }
        }
        console.log("current state of renderables: ", this.renderables);
    }
        

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }
    

    render(gl: WebGLRenderingContext) {

        for (let i = 0 ; i < this.renderables.length; i++) {
            let r = this.renderables[i];
            if (r) {
                r.render(this);
            }
        }
    }
}


// small tie-together of data & renderer. 
// used to interact with the rendering behaviour of a renderableMesh.
// TODO: typecheck if data & renderer are compatible
export class Renderable {
    
    renderer: Renderer;
    data: any;
    speed: DrawSpeed;

    constructor(renderer: Renderer, data: any, speed: DrawSpeed) {

        this.renderer = renderer;
        this.data = data;
        this.speed = speed;
    }


    setData(data: any) {
        this.data = data;
    }


    buffer() {
        this.renderer.buffer(this.data, this.speed);
    }


    render(context: Scene) {
        if (this.speed == DrawSpeed.DynamicDraw) {
            this.buffer();
        }
        this.renderer.render(context);
    }
}


// one p
export class MultiRenderable {

    renderer: Renderer[];
    data: any;
    speed: DrawSpeed;

    constructor(speed: DrawSpeed) {

        this.renderer = [];
        this.data;
        this.speed = speed;
    }
}