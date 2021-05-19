// Name:    index.ts
// Author:  Jos Feenstra
// Purpose: Entry point

import { Core, Renderer, SwapApp } from "../src/lib";

import { DotApp3 } from "./apps/dot-app3";
import { SphericalTwoApp } from "./apps/spherical/spherical-two-app";
import { GeometryApp } from "./apps/geometry-app";
import { IcosahedronApp } from "./apps/icosahedron-app";
import { MeshInspectorApp } from "./apps/mesh-inspector-app";
import { ObjLoaderApp } from "./apps/obj-loader-app";
import { StatApp } from "./apps/old/stat-app";

import { SphericalOneApp } from "./apps/spherical/spherical-one-app";
import { SphericalThreeApp } from "./apps/spherical/spherical-three-app";
import { LeastSquaresApp } from "./apps/math/least-squares-app";
import { UITestApp } from "./apps/ui-test-app";
import { SphericalLandingApp } from "./apps/spherical/spherical-landing";
import { SplineApp } from "./apps/math/spline-app";
import { SurfaceApp } from "./apps/math/surface-app";

var core: Core;

function main() {
    // get references of all items on the canvas
    let canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    let video = document.getElementById("camera")! as HTMLVideoElement;
    let ui = document.getElementById("interface") as HTMLDivElement;
    let cameraOn = document.getElementById("camera-on")! as HTMLButtonElement;
    let cameraStop = document.getElementById("camera-off")! as HTMLButtonElement;
    let buttonPredict = document.getElementById("predict")! as HTMLButtonElement;

    // init core
    let gl = Renderer.initWebglContext(canvas);
    core = new Core(canvas, gl, ui);

    // init swap app
    let appCollection = [
        SurfaceApp,
        SplineApp,
        SphericalTwoApp,
        SphericalThreeApp,
        SphericalOneApp,
        LeastSquaresApp,
        GeometryApp,
        MeshInspectorApp,
        IcosahedronApp,
        DotApp3,
        ObjLoaderApp,
    ];

    let swapApp = new SwapApp(gl, core, appCollection);
    core.addApp(swapApp);
    // swapApp.swap(0);
    swapApp.swapFromUrl(location.hash, 0);

    // a specific app dealing with webcams & other things
    // addWebcamAppWhenReady(core, canvas, video);

    // infinite loop
    function loop() {
        core.update();
        core.draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

window.addEventListener("load", main, false);
