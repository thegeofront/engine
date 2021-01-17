// Author: Jos Feenstra
// Purpose: Entry point

import {addWebcamAppWhenReady, WebcamApp} from "./app/webcam-app";
import {DebugApp} from "./app/debug-app";
import { InputState } from "./system/InputHandler";
import { App } from "./app/app";
import { WebglHelpers } from "./render/webgl-helpers";
import { VectorApp } from "./app/vector-app";
import { initWebglContext } from "./render/renderer";

const REALTIME_DEMO = false;

function main() {

    // get references of all items on the canvas
    let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    let video = document.getElementById("camera")! as HTMLVideoElement;
    let context = document.getElementById("interface")  as HTMLDivElement;
    let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
    let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
    let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;
    
    const core = new Core(canvas);

    //core.addApp(new DebugApp(canvas, context));
    core.addApp(new VectorApp()); 
    //addWebcamAppWhenReady(core, canvas, video);

    // infinite loop
    function loop() {

        console.log(core.STOP);
        if (core.STOP) 
            return;

        core.update();
        core.draw();
        
        setTimeout(() => {
            requestAnimationFrame(loop);
        }, 10);
    }
    loop();
    // requestAnimationFrame(loop);

    // we broke out of the loop
    console.log("app has stopped.");
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

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = initWebglContext(canvas);
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
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.apps.forEach((app) => {
            app.draw(this.gl);
        })
    }
}
