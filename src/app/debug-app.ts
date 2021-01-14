// debug-app
// author: Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { addDropFileEventListeners } from "../input/domwrappers";
import { EyeFinder } from "../process/EyeFinder";
import { BellusScanData } from "../input/BellusData";
import { CtxRenderer } from "../draw/CtxRenderer"; 
import { Vector2 } from "../math/Vector2";
import { GeonImage } from "../img/Image";

const settings = require('../process/settings.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
const STOP = false;

export function RunEyeFinderDemo(canvas: HTMLCanvasElement, context: HTMLDivElement) {

    // setup the app
    const app = new DebugApp(canvas, context);
    app.start();

    // start the file listening
    addDropFileEventListeners(document, processFiles.bind(app));

    // start infinite loop
    loop(app);
}

function loop(app: DebugApp) {
    app.update();
    app.draw();

    if (STOP) return;

    requestAnimationFrame(() => loop(app));
}

async function processFiles(this: DebugApp, files: FileList) {
    
    BellusScanData.fromFileList(files, settings).then(
        (bsd) => this.addBellusData(bsd)
    );
}

class DebugApp {

    canvas: HTMLCanvasElement;
    context: HTMLDivElement;
    r: CtxRenderer;
    points: Vector2[] = [];
    bsd?: BellusScanData;

    constructor(canvas: HTMLCanvasElement, context: HTMLDivElement) {
        
        this.canvas = canvas;
        this.context = context;
        this.r = new CtxRenderer(canvas);
    }

    start() {
        
        this.points.push(new Vector2(0, 0,));
    }

    update() {
        this.points.forEach((p) => {
            p.addn(0.1, 0.1);
        })
    }

    draw() {
        // this.r.clear();
        this.points.forEach((p) => this.r.drawPoint(p));
    }

    addBellusData(bsd: BellusScanData) {
        this.bsd = bsd;

        let image = GeonImage.fromImageData(bsd.texture);
        
        let trim = image.resizeNN(500,500);
        this.r.drawImage(trim);
    }
}
