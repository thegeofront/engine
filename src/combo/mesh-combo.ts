import { Matrix4 } from "../math/matrix";
import { Mesh } from "../mesh/mesh";
import { Renderable } from "../mesh/render-mesh";
import { Context } from "../render/context";
import { DrawSpeed } from "../render/shader";
import { MeshDebugShader } from "../shaders/mesh-debug-shader";
import { TransformLineRenderer } from "../shaders/transform-line-shader";
import { TransformMeshRenderer } from "../shaders/transform-mesh-shader";
import { Combo } from "./combo";

export class StaticMeshCombo extends Combo<Mesh, Renderable, TransformLineRenderer> {
    color: number[];
    linecolor: number[];
    renderer2: TransformMeshRenderer;

    private constructor(gl: WebGLRenderingContext) {
        super(gl, Mesh.newEmpty(0, 0, 0), TransformLineRenderer.new);
        this.color = [0, 0, 0, 0.8];
        this.linecolor = [0.3, 0.3, 0.3, 1];
        this.renderer2 = new TransformMeshRenderer(gl);
    }

    static new(gl: WebGLRenderingContext): StaticMeshCombo {
        return new StaticMeshCombo(gl);
    }

    set(mesh: Mesh) {
        this.state = mesh;
        this.buffer();
    }

    // how to convert from state to buffered
    buffer() {
        this.buffered = this.state.toRenderable();
        this.buffered.calculateFaceNormals();
        this.buffered.color = this.color;
        this.buffered.linecolor = this.linecolor;
        this.commit();
    }

    commit() {
        this.buffered.color = this.color;
        this.buffered.linecolor = this.linecolor;
        this.renderer.set(this.buffered, DrawSpeed.StaticDraw);
        this.renderer2.set(this.buffered, DrawSpeed.StaticDraw);
    }

    render(context: Context) {
        this.renderer2.render(context);
        this.renderer.render(context);
    }
}
