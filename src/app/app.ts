import { InputState } from "../system/input-state"
import { UI } from "../system/ui";

export class App {

    gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        // unique constructor    
        this.gl = gl;
    }

    ui(ui: UI) {
        // setup for UI
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