// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { Graph, DrawSpeed, Context } from "../lib";
import { MultiShader } from "../render/multi-shader";
import { DotRenderer3 } from "./dot-shader";
import { LineRenderer } from "./line-shader";
import { NormalRenderer } from "./mesh-normals-shader";
import { SimpleMeshShader } from "./simple-mesh-shader";

export class GraphDebugRenderer extends MultiShader<Graph> {
    faceRend: SimpleMeshShader;
    lineRend: LineRenderer;
    pointRend: DotRenderer3;
    normRend?: NormalRenderer;

    constructor(
        gl: WebGLRenderingContext,
        faceColor = [1, 0, 0, 0.25],
        edgeColor = [1, 0, 0, 1],
        renderNormal = true,
    ) {
        super();
        this.faceRend = new SimpleMeshShader(gl, faceColor);
        this.lineRend = new LineRenderer(gl, edgeColor);
        this.pointRend = new DotRenderer3(gl, 7, edgeColor, false);
        if (renderNormal) this.normRend = new NormalRenderer(gl);
    }

    set(graph: Graph, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        //this.faceRend.setMesh(gl, mesh);

        this.pointRend.set(graph.allVertPositions(), speed);
        this.lineRend.set(graph.toLines(), speed);
        // this.normRend?.setWithLists(graph.allVertPositions(), graph.allNorms(), speed);
    }

    // render 1 image to the screen
    render(c: Context) {
        this.pointRend.render(c);
        // this.faceRend.render(gl, camera.totalMatrix);
        this.lineRend.render(c);
        // this.normRend?.render(gl, camera);
    }

    setAndRender(r: Graph, context: Context): void {
        throw new Error("Method not implemented.");
    }
}
