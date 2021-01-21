// purpose: wrap 
import { GeonImage } from "../img/Image";
import { Vector2 } from "../math/vector";
import { InputState } from "../system/input-state";

export class CtxRenderer {
    
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;

    // 'camera'
    scale: number = 0;
    xOffset: number = 0;
    yOffset: number = 0;

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

    private transform(p: Vector2) : Vector2 {
        
        return p.clone().addn(this.xOffset, this.yOffset).scale(this.scale);
    }

    // ------- draw wrappers -------
    
    drawPoint(p: Vector2) {

        // draw a small white dot at x, y
        let v = this.transform(p);

        const ctx = this.ctx;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(v.x, v.y, 3, 0, 7, false);
        ctx.fill();
    } 

    drawImage(p: Vector2, image: GeonImage) {

        // draw an image
        let v = this.transform(p);
        const ctx = this.ctx;

        let data = image.scale(this.scale, this.scale).toImageData();
        ctx.putImageData(data, v.x, v.y);
    }


    public setScale(scale: number)
    {
        this.scale = scale;
        this.setWindow();
    }

    private setWindow()
    {
        console.log("setting window...");

        this.canvas.width = document.body.clientWidth / this.scale;
        this.canvas.height = document.body.clientHeight / this.scale;
        this.canvas.style.width  = document.body.clientWidth + "px";
        this.canvas.style.height = document.body.clientHeight + "px";

        if (this.scale != 1)
        {
            this.canvas.style.imageRendering = "crisp-edges";
        }
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
}