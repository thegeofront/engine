// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../mesh/line-array";
import { Vector3Array } from "../data/vector-array";
import { RenderMesh } from "../mesh/render-mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { LineRenderer } from "./line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";
import { NormalRenderer } from "./mesh-normals-renderer";
import { ShadedMeshRenderer } from "./shaded-mesh-renderer";
import { Graph } from "../mesh/graph";
import { PureMesh } from "../mesh/pure-mesh";
import { Camera } from "./camera";

export class GraphRenderer {

    faceRend: ShadedMeshRenderer;
    lineRend: LineRenderer;

    constructor(gl: WebGLRenderingContext) {
        this.faceRend = new ShadedMeshRenderer(gl);
        this.lineRend = new LineRenderer(gl, [1,1,1,1]);
    }

    setAndRender(gl: WebGLRenderingContext, camera: Camera, graph: Graph) {
        this.set(gl, graph);
        this.render(gl, camera);
    }

    set(gl: WebGLRenderingContext, graph: Graph) {

        let meshes: PureMesh[] = [];

        graph.getVertRenderData().forEach((v) => {
            meshes.push(PureMesh.fromSphere(v, 0.05, 6, 10))
        })

        let edges = graph.getEdgeRenderData()
        for (let i = 0 ; i < edges.length; i+=2) {
            let from = edges[i];
            let to = edges[i+1];
        }

        let rmesh = PureMesh.fromJoin(meshes).toDisplayMesh();
        rmesh.calculateFaceNormals();
        this.faceRend.set(gl, rmesh);
        this.lineRend.set(gl, LineArray.fromLines(edges), DrawSpeed.StaticDraw);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, camera: Camera) {
        this.faceRend.render(gl, camera);
        this.lineRend.render(gl, camera.totalMatrix);
    }
}