// debug-app
// author: Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { addDropFileEventListeners } from "../input/domwrappers";
import { EyeFinder } from "../process/EyeFinder";
import { BellusScanData } from "../input/BellusData";
import { CtxRenderer } from "../draw/CtxRenderer"; 
import { Vector2 } from "../math/Vector2";
import { GeonImage } from "../img/Image";
import { InputHandler } from "../system/InputHandler";
import { input } from "@tensorflow/tfjs";
import { getMaxTexturesInShader } from "@tensorflow/tfjs-backend-webgl/dist/webgl_util";

const settings = require('../process/settings.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

export class DebugApp {

    canvas: HTMLCanvasElement;
    context: HTMLDivElement;
    r: CtxRenderer;

    // main input data 
    bsd?: BellusScanData;

    // draw things
    landmarks: Vector2[] = [];
    images: GeonImage[] = [];
    imagelocs: Vector2[] = [];

    constructor(canvas: HTMLCanvasElement, context: HTMLDivElement) {
        
        this.canvas = canvas;
        this.context = context;

        this.r = new CtxRenderer(canvas);
        this.r.scale = 0.1;
    }

    start() {
        addDropFileEventListeners(document, processFiles.bind(this));
    }

    update(state: InputHandler) {

        if (state.IsKeyPressed("-"))  this.r.scale += 0.01;
        if (state.IsKeyPressed("="))  this.r.scale +=  -0.01;
        if (state.IsKeyDown("a")) this.r.xOffset += 10;
        if (state.IsKeyDown("d")) this.r.xOffset -= 10;
        if (state.IsKeyDown("w")) this.r.yOffset += 10;        
        if (state.IsKeyDown("s")) this.r.yOffset -= 10;
    }

    draw(gl: WebGLRenderingContext) {
        
        this.r.clear();

        // draw images 
        for (let i = 0 ; i < this.images.length; i++) {
            let image = this.images[i];
            let loc = this.imagelocs[i];
            this.r.drawImage(loc, image);
        }

        // draw landmarks
        this.landmarks.forEach((p) => {
            this.r.drawPoint(p);
        });  
    }

    addBellusData(bsd: BellusScanData) {

        this.bsd = bsd;
        let landmarks = bsd.getLandmarks2f().toVector2();
        let image = GeonImage.fromImageData(bsd.texture);
        
        // visualize this data
        this.landmarks = landmarks; 
        this.images.push(image);
        this.imagelocs.push(new Vector2(0, 0));

        // extract eyes, ears, and brows from the image
    }
}

async function processFiles(this: DebugApp, files: FileList) {
    
    BellusScanData.fromFileList(files, settings).then(
        (bsd) => this.addBellusData(bsd)
    );
}