// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import { GeonImage } from "../img/Image";
import { Domain, Domain2, Domain3 } from "../math/domain";
import { Matrix3 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";
import { ImageRenderer } from "../render/image-renderer";
import { RectangleRenderer } from "../render/rectangle-renderer";
import { InputState } from "../system/input-state"
import { App } from "../app/app"
import { DotRenderer2 } from "../render/dot-renderer2";

export class DotApp2 extends App {

    dots: Vector2[] = [];
    dirs: Vector2[] = [];

    bounds: Domain2;
    renderer: DotRenderer2;

    // unique constructors
    constructor(gl: WebGLRenderingContext) {
        super();
        this.bounds = Domain2.fromBounds(0, 500, 0, 500);
        this.renderer = new DotRenderer2(gl, 5, [1,1,1,1], true);
    }

    start() {
        // additional setup of state
        let normrange = 5;
        let count = 10;
        const normSpace = Domain2.fromBounds(-normrange, normrange, -normrange, normrange);
        
        for (let i = 0 ; i < count; i++) {

            this.dots.push(this.bounds.elevate(Vector2.fromRandom()));
            this.dirs.push(normSpace.elevate(Vector2.fromRandom()));
        }
    }

    update(state: InputState) {
        for (let i = 0 ; i < this.dots.length; i++) {

            // these 'should' be pointers, but check this
            let dot = this.dots[i];
            let dir = this.dirs[i];

            // bounce of the edges
            if (!this.bounds.x.includes(dot.x))
                dir.x = -dir.x
            if (!this.bounds.y.includes(dot.y))
                dir.y = -dir.y
            
            dot.add(dir);

            if (state.IsKeyDown(" "))
                console.log(dot);
        }  
    }

    draw(gl: WebGLRenderingContext) {
        this.renderer.render(gl, this.dots);
    }
}