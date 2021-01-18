// Author: Jos Feenstra
// Purpose: Entry point

import {addWebcamAppWhenReady, WebcamApp} from "./app/webcam-app";
import {DebugApp} from "./app/debug-app";
import { InputState } from "./system/InputState";
import { App } from "./app/app";
import { initWebglContext, Renderer } from "./render/renderer";
import { DotApp2 } from "./app-demos/dot-app2";
import { RectangleApp } from "./app-demos/rectangle-app";
import { DotApp3 } from "./app-demos/dot-app3";

const REALTIME_DEMO = false;

function main() {

    // get references of all items on the canvas
    let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    let video = document.getElementById("camera")! as HTMLVideoElement;
    let context = document.getElementById("interface")  as HTMLDivElement;
    let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
    let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
    let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;
    

    let gl = initWebglContext(canvas);
    const core = new Core(canvas, gl);

    //core.addApp(new DebugApp(canvas, context));
    // core.addApp(new RectangleApp(gl)); 
    core.addApp(new DotApp3(gl, canvas)); 
    //addWebcamAppWhenReady(core, canvas, video);

    // infinite loop
    function loop() {
 
        if (core.STOP) 
            return;

        core.update();
        core.draw();
        
        requestAnimationFrame(loop);
    }
    // loop();
    requestAnimationFrame(loop);

    // we broke out of the loop
    // console.log("app has stopped.");
}


window.addEventListener("load", function() {
    main();
}, false);


export class Core {

    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    state: InputState;
    private apps: App[];
    STOP = false;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        this.canvas = canvas;
        this.gl = gl;
        this.state = new InputState(canvas);
        this.apps = [];
    }

    addApp(app: App) {
        this.apps.push(app);
        app.start();
    }

    update() {
        this.state.preUpdate();
        if (this.state.IsKeyPressed("Esc"))
            this.STOP = true;
        this.apps.forEach((app) => {
            app.update(this.state);
        });
        this.state.postUpdate();
    }

    draw() {
        const canvas = this.canvas;
        const gl = this.gl

        // pre-gl business
        if (window.innerHeight != canvas.height || 
            window.innerWidth  != canvas.width) 
        {
            canvas.height = window.innerHeight;
            // canvas.clientHeight = window.innerHeight;
            canvas.style.height = window.innerHeight.toString();

            canvas.width  = window.innerWidth;
            // canvas.clientWidth = window.innerWidth;
            canvas.style.width = window.innerWidth.toString();

            gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        }

        // Renderer.resizeCanvas(this.gl);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // render all apps
        // TODO : reverse order
        this.apps.forEach((app) => {
            app.draw(this.gl);
        })
    }
}
