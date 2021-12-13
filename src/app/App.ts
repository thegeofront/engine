import { InputState } from "../input/InputState";
import { UI } from "../dom/UI";
import { InputHandler } from "../lib";

export class App {
    gl: WebGLRenderingContext;
    name: string;
    description: string;

    constructor(gl: WebGLRenderingContext, des: string = "") {
        // unique constructor
        this.gl = gl;
        this.name = this.constructor.name;
        this.description = des;
    }

    ui(ui: UI) {
        // setup for UI
    }

    start() {
        // additional setup of state
    }

    update(input: InputHandler) {
        // updating state
    }

    draw() {
        // drawing state
    }
}
