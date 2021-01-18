// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import { GeonImage } from "../img/Image";
import { Domain, Domain2, Domain3 } from "../math/domain";
import { Matrix3 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/Vector";
import { ImageRenderer } from "../render/image-renderer";
import { RectangleRenderer } from "../render/rectangle-renderer";
import { InputState } from "../system/InputHandler"
import { App } from "../app/app"
import { DotRenderer } from "../render/dot-renderer";

export class DotApp extends App {

    dots: Vector2[] = [];
    dirs: Vector2[] = [];

    bounds: Domain2;
    renderer: DotRenderer;

    // unique constructors
    constructor(gl: WebGLRenderingContext) {
        super();
        this.bounds = Domain2.new(0, 500, 0, 500);
        this.renderer = new DotRenderer(gl, 100, [1,1,1,1], true);
    }

    start() {
        // additional setup of state
        let normrange = 5;
        let count = 10000;
        const normSpace = Domain2.new(-normrange, normrange, -normrange, normrange);
        
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