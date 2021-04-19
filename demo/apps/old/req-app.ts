import { App, Camera, Mesh, MeshDebugRenderer, Parameter, UI, Vector3 } from "../../../src/lib";
import { MultiRenderer } from "../../../src/render/auto-renderer";
import { Light, RenderInfo } from "../../../src/render/render-info";

export class RenderContextApp extends App {
    index!: Parameter;
    interface!: UI;

    info: RenderInfo;
    // debugger: Debugger;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.info = RenderInfo.new(new Camera(canvas, 1, true));
        // this.debugger = MultiRenderer.new(
        //     100,
        //     new MeshDebugRenderer(gl, [0.5, 0, 0, 1], [1, 0, 0, 1], false),
        // );
    }

    ui(ui: UI) {}

    start() {
        // this.debugger.add(Mesh.newCone(Vector3.new(0, 0, 0), 5, 5, 5).toRenderable());
    }

    update() {}

    draw() {}
}
