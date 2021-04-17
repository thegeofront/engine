// // small tie-together of data & renderer.
// // used to interact with the rendering behaviour of a renderableMesh.
// // TODO: typecheck if data & renderer are compatible

// import { Renderer, DrawSpeed } from "./renderer";
// import { Scene } from "./scene";

// // TODO add this information to the new Renderable

// export class StaticRenderUnit<R extends Renderer, D> {
//     renderer: R;
//     data: D;

//     constructor(renderer: R, data: D) {
//         this.renderer = renderer;
//         this.data = data;
//     }

//     static new<A extends Renderer, B>(renderer: A, data: B): StaticRenderUnit<A, B> {
//         return new StaticRenderUnit(renderer, data);
//     }

//     buffer() {
//         this.renderer.buffer(this.data);
//     }

//     render(context: Scene) {
//         this.renderer.render(context);
//     }
// }

// export class DynamicRenderUnit<R extends Renderer, D> {
//     renderer: R;
//     data: D;

//     constructor(renderer: R, data: D) {
//         this.renderer = renderer;
//         this.data = data;
//     }

//     static new<A extends Renderer, B>(renderer: A, data: B): DynamicRenderUnit<A, B> {
//         return new DynamicRenderUnit(renderer, data);
//     }

//     render(context: Scene) {
//         this.renderer.buffer();
//         this.renderer.render(context);
//     }
// }
