import { InputState } from "../system/input-state"

export class CtxApp {

    ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        // unique constructor    
        this.ctx = ctx;
    }

    start() {
        // additional setup of state
    }

    update(state: InputState) {
        // updating state
    }

    draw(gl: WebGLRenderingContext) {
        // drawing state
    }
}