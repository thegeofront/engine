// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../data/line-array";
import { Vector3Array } from "../data/vector-array";
import { Mesh } from "../geo/mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { SimpleLineRenderer } from "./simple-line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";

export class MeshRenderer {

    faceRend: SimpleMeshRenderer;
    lineRend: SimpleLineRenderer;

    constructor(gl: WebGLRenderingContext, faceColor = [1,0,0,0.25], edgeColor = [1,0,0,0.25]) {
        this.faceRend = new SimpleMeshRenderer(gl, faceColor);
        this.lineRend = new SimpleLineRenderer(gl, edgeColor);
    }

    setAndRender(gl: WebGLRenderingContext, matrix: Matrix4, mesh: Mesh) {
        this.set(gl, mesh);
        this.render(gl, matrix);
    }

    set(gl: WebGLRenderingContext, mesh: Mesh) {
        this.faceRend.setMesh(gl, mesh);
        this.lineRend.set(gl, LineArray.fromMesh(mesh), DrawSpeed.StaticDraw);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, matrix: Matrix4) {
        this.faceRend.render(gl, matrix);
        this.lineRend.render(gl, matrix);
    }
}