// purpose: wrap 
import { Vector2 } from "../math/Vector2";

export class CtxRenderer {
    
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        this.width = canvas.width;
        this.height = canvas.height;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    resize() {

    }

    // ------- draw wrappers -------
    
    drawPoint(p: Vector2) {

        // draw a small white dot
        const ctx = this.ctx;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 7, false);
        ctx.fill();
    } 

    drawImage(image: ImageData) {

        // draw an image
        const ctx = this.ctx;
        ctx.putImageData(image, 10, 10);
    }
}