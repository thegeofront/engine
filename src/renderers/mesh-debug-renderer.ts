// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { Renderable, Matrix4, DrawSpeed, MultiLine, Context } from "../lib";
import { MetaRenderer } from "../render/meta-renderer";
import { LineRenderer } from "./line-renderer";
import { NormalRenderer } from "./mesh-normals-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";

export class MeshDebugRenderer extends MetaRenderer<Renderable> {
    faceRend: SimpleMeshRenderer;
    lineRend: LineRenderer;
    normRend?: NormalRenderer;
    personal: Matrix4;

    constructor(
        gl: WebGLRenderingContext,
        faceColor = [1, 0, 0, 0.25],
        edgeColor = [1, 0, 0, 1],
        renderNormal = true,
    ) {
        super();
        this.faceRend = new SimpleMeshRenderer(gl, faceColor);
        this.lineRend = new LineRenderer(gl, edgeColor);
        this.personal = Matrix4.newIdentity();
        if (renderNormal) this.normRend = new NormalRenderer(gl);
    }

    static new(
        gl: WebGLRenderingContext,
        faceColor = [1, 0, 0, 0.25],
        edgeColor = [1, 0, 0, 1],
        renderNormal = true,
    ) {
        return new MeshDebugRenderer(gl, faceColor, edgeColor, renderNormal);
    }

    set(data: Renderable, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        this.personal = data.position;
        this.faceRend.set(data.mesh);
        this.lineRend.set(MultiLine.fromMesh(data), speed);
        this.normRend?.set(data, speed);
    }

    render(c: Context) {
        this.faceRend.render(c);
        this.lineRend.render(c);
        this.normRend?.render(c);
    }

    setAndRender(r: Renderable, c: Context) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(c);
    }
}
