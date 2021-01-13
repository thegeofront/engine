// Author: Jos Feenstra
// Purpose: Entry point

import {RunWithDefaultModel} from "./webcam-app";
import {RunEyeFinderDemo} from "./debug-app";

const REALTIME_DEMO = false;

function main() {

    // get references of all items on the canvas
    let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    let video = document.getElementById("camera")! as HTMLVideoElement;
    let context = document.getElementById("interface")  as HTMLDivElement;
    // let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
    // let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
    // let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;
    
    if (REALTIME_DEMO)
        RunWithDefaultModel(canvas, video);
    else 
        RunEyeFinderDemo(canvas, context);
}


window.addEventListener("load", function() {
    main();
}, false);
