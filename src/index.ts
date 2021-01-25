// Author: Jos Feenstra
// Purpose: Entry point

import {addWebcamAppWhenReady, WebcamApp} from "./app/webcam-app";
import {EyeFinderApp} from "./app/eye-finder-app";
import { InputState } from "./system/input-state";
import { App } from "./app/app";
import { initWebglContext, Renderer } from "./render/renderer";
import { DotApp2 } from "./app-demos/dot-app2";
import { RectangleApp } from "./app-demos/rectangle-app";
import { DotApp3 } from "./app-demos/dot-app3";
import { ObjLoaderApp } from "./app/obj-loader-app";
import { Core } from "./core";

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

    // the eyefinder app itself
    core.addApp(new EyeFinderApp(gl, canvas, context));
    
    // fun demo's to test various functionalities 
    // core.addApp(new RectangleApp(gl)); 
    // core.addApp(new DotApp3(gl, canvas)); 
    // core.addApp(new ObjLoaderApp(gl, canvas));
    // addWebcamAppWhenReady(core, canvas, video);

    // infinite loop
    function loop() {
 
        if (core.STOP) {
            // TODO : notify the User that we have stopped running...
            return;
        }
            

        core.update();
        core.draw();
        
        requestAnimationFrame(loop);
    }
    // loop();
    requestAnimationFrame(loop);
}

// __main__ 
window.addEventListener("load", function() {
    main();
}, false);
