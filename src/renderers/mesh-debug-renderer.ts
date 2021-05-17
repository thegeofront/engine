// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { MultiLine } from "../mesh/multi-line";
import { MultiVector3 } from "../data/multi-vector";
import { Renderable } from "../mesh/render-mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "../render/renderer";
import { LineRenderer } from "./line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";
import { NormalRenderer } from "./mesh-normals-renderer";
import { Camera } from "../render/camera";
import { MetaRenderer } from "../render/meta-renderer";
import { Context } from "../render/context";

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
