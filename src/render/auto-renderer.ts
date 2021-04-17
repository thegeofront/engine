import { Pool } from "../data/pool";
import { Renderable } from "../mesh/render-mesh";
import { Camera } from "./camera";
import { RenderInfo } from "./render-info";
import { DrawSpeed, Renderer } from "./renderer";

// wrapper around: draw a bunch of meshes dynamically
export class MultiRenderer<R extends Renderer> {
    constructor(public pool: Pool<Renderable>, public renderer: R) {}

    static new<R extends Renderer>(maxMeshes: number, renderer: R) {
        return new MultiRenderer(Pool.new(maxMeshes), renderer);
    }

    add(r: Renderable) {
        return this.pool.add(r);
    }

    draw(c: RenderInfo) {
        this.pool.iter((i, rend) => {
            this.renderer.buffer(rend, DrawSpeed.DynamicDraw);
            this.renderer.render(c);
        });
    }
}
