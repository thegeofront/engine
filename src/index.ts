import * as draw from "./drawutils";
import {App} from "./app";

// import * as tf from "@tensorflow/tfjs";
import * as tffl from "@tensorflow-models/face-landmarks-detection";
import { model } from "@tensorflow/tfjs";


// get references of all items on the canvas
let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
let camera = document.getElementById("camera")! as HTMLVideoElement;
// let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
// let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
// let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;

let app: App;

// setup the basics
window.addEventListener("load", async function() {

    // start the camera feed
    var constraints = {audio:false, video:true};

    var p = navigator.mediaDevices.getUserMedia(constraints);

    p.then(function(stream) {
        camera.srcObject = stream;
        
        camera.play();
        draw.resize(canvas, camera);
    })

    p.catch(function(err) {
        console.log(err.name + " : " + err.message);
    });


    tffl.load(tffl.SupportedPackages.mediapipeFacemesh).then((model) => {
        app = new App(canvas, camera, model);
        app.update();
    });


}, false);




