import { InputState } from "../system/input-state"

export class App {

    gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        // unique constructor    
        this.gl = gl;
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