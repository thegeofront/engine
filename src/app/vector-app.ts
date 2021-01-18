// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import { Rectangle2 } from "../geo/Rectangle";
import { Domain, Domain2, Domain3 } from "../math/domain";
import { Matrix3 } from "../math/matrix";
import { Vector3 } from "../math/Vector";
import { RectangleRenderer } from "../render/rectangle-renderer";
import { InputState } from "../system/InputHandler"
import { App } from "./app"

export class VectorApp extends App {

    recs: Rectangle2[] = [];
    dirs: Vector3[] = [];

    bounds: Domain3;
    renderer: RectangleRenderer;
    

    // unique constructors
    constructor(gl: WebGLRenderingContext) {
        super();
        this.bounds = Domain3.new(-500, 500, -500, 500, -500, 500);
        this.renderer = new RectangleRenderer(gl)
    }

    start() {
        // additional setup of state
        const normSpace = Domain3.new(-1, 1, -1, 1, -1, 1);
        for (let i = 0 ; i < 1; i++) {

            this.recs.push(new Rectangle2(
                Matrix3.newIdentity(),
                Domain2.new(-1, 1, -1, 1),
            ));
            this.dirs.push(normSpace.elevate(Vector3.fromRandom()));
        }
    }

    update(state: InputState) {
        // updating state
        for (let i = 0 ; i < this.recs.length; i++) {

            // these 'should' be pointers, but check this
            let rec = this.recs[i];
            let dir = this.dirs[i];

            // bounce of the edges
            let center = rec.center();
            if (!this.bounds.x.includes(center.x))
                dir.x = -dir.x
            if (!this.bounds.y.includes(center.y))
                dir.y = -dir.y
            // if (!this.bounds.z.includes(center.z))
            //     dir.z = -dir.z

            // move & rotate
            rec.pose.translateN(dir.x, dir.y);
            rec.pose.rotate(0.01);

            
            if (state.IsKeyPressed("q"))
            {
                console.log(rec.center().toString());
            }
                
                //console.log(rec.center().toString());
        }  

    }

    draw(gl: WebGLRenderingContext) {
        // drawing state

        // render the points like boxes which are flying around
        this.renderer.render(gl, this.recs);
    }
}