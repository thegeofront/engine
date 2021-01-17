// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/Vector";
import { InputState } from "../system/InputHandler"
import { App } from "./app"

export class VectorApp extends App {

    points: Vector3[] = [];
    dirs: Vector3[] = [];
    bounds: Domain3;

    // unique constructors
    constructor() {
        super();
        this.bounds = Domain3.new(-500, 500, -500, 500, -500, 500);
    }

    start() {
        // additional setup of state
        const normSpace = Domain3.new(-1, 1, -1, 1, -1, 1);
        for (let i = 0 ; i < 100; i++) {

            this.points.push(this.bounds.elevate(Vector3.fromRandom()));
            this.dirs.push(normSpace.elevate(Vector3.fromRandom()));
        }
    }

    update(state: InputState) {
        // updating state
        for (let i = 0 ; i < this.points.length; i++) {

            // these 'should' be pointers, but check this
            let dir = this.dirs[i];
            let point = this.points[i];

            // bounce of the edges
            if (!this.bounds.x.includes(point.x))
                dir.x = -dir.x
            if (!this.bounds.y.includes(point.y))
                dir.y = -dir.y
            if (!this.bounds.z.includes(point.z))
                dir.z = -dir.z

            // move
            point.add(dir);
        }  
    }

    draw(gl: WebGLRenderingContext) {
        // drawing state

        // render the points like boxes which are flying around
    }
}