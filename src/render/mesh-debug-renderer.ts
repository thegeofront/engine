// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../mesh/line-array";
import { Vector3Array } from "../data/vector-array";
import { Renderable } from "../mesh/render-mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { LineRenderer } from "./line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";
import { NormalRenderer } from "./mesh-normals-renderer";
import { Camera } from "./camera";

export class MeshDebugRenderer {

    faceRend: SimpleMeshRenderer;
    lineRend: LineRenderer;
    normRend: NormalRenderer;

    constructor(gl: WebGLRenderingContext, faceColor = [1,0,0,0.25], edgeColor = [1,0,0,1]) {
        this.faceRend = new SimpleMeshRenderer(gl, faceColor);
        this.lineRend = new LineRenderer(gl, edgeColor);
        this.normRend = new NormalRenderer(gl);
    }

    set(gl: WebGLRenderingContext, mesh: Renderable) {
        this.faceRend.setMesh(gl, mesh);
        this.lineRend.set(gl, LineArray.fromMesh(mesh), DrawSpeed.StaticDraw);
        this.normRend.set(mesh, DrawSpeed.StaticDraw);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, camera: Camera) {
        this.faceRend.render(gl, camera.totalMatrix);
        this.lineRend.render(gl, camera.totalMatrix);
        this.normRend.render(gl, camera);
    }
}