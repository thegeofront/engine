// Name:    index.ts
// Author:  Jos Feenstra
// Purpose: Entry point

// import {addWebcamAppWhenReady, WebcamApp} from "./apps/webcam-app";
import { InputState } from "../src/system/input-state";
import { App } from "../src/app/app";
import { Renderer } from "../src/render/renderer";
import { DotApp3 } from "./apps/dot-app3";
import { ObjLoaderApp } from "./apps/obj-loader-app";
import { Core } from "../src/system/core";
import { StatApp } from "./apps/stat-app";
import { GeometryApp } from "./apps/geometry-app";
import { MarchingCubeApp } from "./apps/marching-cube-app";
import { MeshInspectorApp } from "./apps/mesh-inspector-app";
import { SwapApp } from "../src/app/swap-app";
import { IcosahedronApp } from "./apps/icosahedron-app";
import { SubdivideApp } from "./apps/subdivide-app";
import { RequestApp } from "./apps/req-app";

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
        RequestApp,
        SubdivideApp,
        GeometryApp,
        MeshInspectorApp,
        IcosahedronApp,
        ObjLoaderApp,
        DotApp3,
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
