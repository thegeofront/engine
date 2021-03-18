// Name:    index.ts
// Author:  Jos Feenstra
// Purpose: Entry point

import {addWebcamAppWhenReady, WebcamApp} from "./app/webcam-app";
import {EyeFinderApp} from "./sfered/eye-finder-app";
import { InputState } from "./system/input-state";
import { App } from "./app/app";
import { Renderer } from "./render/renderer";
import { DotApp2 } from "./app-demos/dot-app2";
import { DotApp3 } from "./app-demos/dot-app3";
import { ObjLoaderApp } from "./app/obj-loader-app";
import { Core } from "./core";
import { StatApp } from "./app/stat-app";
import { GeometryApp } from "./app/geometry-app";
import { MarchingCubeApp } from "./app/marching-cube-app";
import { MeshInspectorApp } from "./app/mesh-inspector-app";
import { SwapApp } from "./app/swap-app";

var core: Core;

function main() {

    // get references of all items on the canvas
    let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    let video = document.getElementById("camera")! as HTMLVideoElement;
    let ui = document.getElementById("interface")  as HTMLDivElement;
    let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
    let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
    let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;
    
    // init core 
    let gl = Renderer.initWebglContext(canvas);
    core = new Core(canvas, gl, ui);

    // init swap app
    let appCollection = [
        MeshInspectorApp,
        EyeFinderApp,
        GeometryApp,
        DotApp3,
        ObjLoaderApp,
        StatApp,
    ]

    let swapApp = new SwapApp(gl, core, appCollection);
    core.addApp(swapApp);
    swapApp.swap(0);

    // a specific app dealing with webcams & other things
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
    requestAnimationFrame(loop);
}
window.addEventListener("load", function() {
    main();
}, false);
