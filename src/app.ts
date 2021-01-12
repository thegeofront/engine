import { AnnotatedPrediction } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import { Coord2D } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";

require("@tensorflow/tfjs-backend-webgl");

import { Vector2 } from "./math/Vector2";
import { Triangle2 } from "./math/Triangle2";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";

export class App {

    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    
    points: Array<Vector2>;
    triangles: Array<Triangle2>;

    drawVideo: boolean = false;
    model: MediaPipeFaceMesh;
    // ------- basics -------

    constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement, model: MediaPipeFaceMesh) {
        
        this.canvas = canvas;
        this.video = video;
        this.ctx = canvas.getContext("2d", { alpha: false })!;
        this.points = [];
        this.triangles = [];
        this.model = model;
        this.start();
    }

    start() {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let video = this.video;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // load the tensorflow face mesh predictor
        

        canvas.addEventListener("click", this.clickEvent.bind(this));
        video.addEventListener("loadeddata", (ev: Event) => {

            this.drawVideo = true;
            this.startPredictions();
        });
    }

    update() {
        
        this.canvas.width = 1000;
        this.canvas.height = 800;
        
        this.canvas.style.width = "1000";
        this.canvas.style.height = "800";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.drawVideo)
        {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            this.startPredictions();
        }

        this.points.forEach((p) => {
            drawPoint(this.ctx, p);
        })

        requestAnimationFrame(this.update.bind(this));
    }

    // ------- interface -------
    async startPredictions() {

        // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
        // array of detected faces from the MediaPipe graph. If passing in a video
        // stream, a single prediction per frame will be returned.
        console.log("estimating...");
        this.model.estimateFaces({
            input: this.video
        }).then((predictions) => {
            
            console.log("drawing...");
    
            // just draw 1 face
            if (predictions.length == 1) {
                
                // draw.drawPrediction(ctx, predictions[0]);
                this.visualizePrediction(predictions[0]);
            } else {
                console.log("not 1 face");
            }  
            console.log("done!"); 
        });
    }

    flushPoints() {
        this.points = [];
    }

    addPoint(p: Vector2) {
        this.points.push(p);
    }

    addPoints(points: Vector2[]) {
        points.forEach((p) => {
            this.addPoint(p);
        })
    }

    flushTriangle(t: Triangle2) {
        this.triangles = [];
    }

    addTriangle(t: Triangle2) {
        this.triangles.push(t);
    }

    visualizePrediction(prediction: AnnotatedPrediction) {

        // bounding box
        let tl = prediction.boundingBox.topLeft as Coord2D;
        let br = prediction.boundingBox.bottomRight as Coord2D;

        let a = Vector2.fromArray(tl);
        let b = Vector2.fromArray(br);
        let c = new Vector2(a.x, b.y);
        let d = new Vector2(b.x, a.y);

        this.addPoints([a, b, c, d]);
    }



    // ------- events -------

    clickEvent(e: MouseEvent) {
        let x = e.x;
        let y = e.y;
    
        console.log("click at {}, {}", x, y);
        this.points.push(new Vector2(x, y))
    }

}

// ----- pure utils -----

function drawPoint(ctx: CanvasRenderingContext2D, p: Vector2) {
        
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    // ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 7, false);
    ctx.fill();
} 