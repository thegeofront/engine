import { Vector3 } from "../math/Vector";
import { InputHandler } from "../system/InputHandler"
import { App } from "./app"

export class VectorApp extends App {

    points: Vector3[] = [];

    // unique constructors
    constructor() {
        super();
    }

    start() {
        // additional setup of state
        for (let i = 0 ; i < 100; i++)
        {
            this.points.push(Vector3.fromRandom().scale(100));
        }

    }

    update(state: InputHandler) {
        // updating state
    }

    draw(gl: WebGLRenderingContext) {
        // drawing state
    }
}