import { InputState } from "../system/input-state"
import { UI } from "../system/ui";

export class App {

    gl: WebGLRenderingContext;
    name: string;

    constructor(gl: WebGLRenderingContext) {
        // unique constructor    
        this.gl = gl;
        this.name = this.constructor.name;
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