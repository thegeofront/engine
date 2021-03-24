// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { GraphModel } from "@tensorflow/tfjs-converter";
import { Matrix4 } from "../math/matrix";
import { Vector3 } from "../math/vector";
import { Graph } from "../mesh/graph";
import { PureMesh } from "../mesh/pure-mesh";
import { RenderMesh } from "../mesh/render-mesh";
import { Camera } from "../render/camera";
import { ShadedMeshRenderer } from "../render/shaded-mesh-renderer";
import { InputState } from "../system/input-state";
import { Parameter, UI } from "../system/ui";
import { App } from "./app";

export class GraphApp extends App {

    camera: Camera;
    meshRend: ShadedMeshRenderer;
    
    rotate!: Parameter;

    graph!: Graph;
    mesh!: RenderMesh;

    constructor(gl: WebGLRenderingContext) {
        
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.meshRend = new ShadedMeshRenderer(gl);
    }

    getIcosahedron() : Graph {
        let graph = new Graph();

        let a = 1;
        let phi = (1 + 5**0.5) / 2
        let b = a * phi;

        graph.addVert(new Vector3(-a,-b, 0)); 
        graph.addVert(new Vector3( a,-b, 0)); 
        graph.addVert(new Vector3(-a, b, 0));
        graph.addVert(new Vector3( a, b, 0));

        graph.addVert(new Vector3(0,-a,-b)); 
        graph.addVert(new Vector3(0, a,-b)); 
        graph.addVert(new Vector3(0,-a, b));
        graph.addVert(new Vector3(0, a, b));

        graph.addVert(new Vector3(-b, 0,-a));
        graph.addVert(new Vector3(-b, 0, a)); 
        graph.addVert(new Vector3( b, 0,-a));
        graph.addVert(new Vector3( b, 0, a));

        // build edges
        let addEdge = (a: number, b: number) => {
            let norm = graph.getVertex(a).added(graph.getVertex(b)).scale(0.5);
            graph.addEdge(a, b, norm);
        }

        for (let i = 0 ; i < 12; i+=4) {

            addEdge(i+0, i+1);
            addEdge(i+2, i+3);

            let inext = (i + 4) % 12;

            // addEdge(i+0, inext+2);
            // addEdge(i+0, inext+0);
            // addEdge(i+1, inext+2);
            // addEdge(i+1, inext+0);

            // addEdge(i+2, inext+3);
            // addEdge(i+2, inext+1);
            // addEdge(i+3, inext+3);
            // addEdge(i+3, inext+1);
        }        

        return graph;
    }

    demo() : Graph {

        let graph = new Graph();
        graph.addVert(new Vector3(0,0,0)); // 0
        graph.addVert(new Vector3(1,0,0)); // 1
        graph.addVert(new Vector3(0,1,0));
        graph.addVert(new Vector3(-1,0,0));
        graph.addVert(new Vector3(0,-1,0));

        let normal = new Vector3(0,0,1);
        graph.addEdge(0,1, normal);
        graph.addEdge(0,2, normal);
        graph.addEdge(0,3, normal);
        graph.addEdge(0,4, normal);
        graph.addEdge(1,2, normal);

        return graph
    }

    ui(ui: UI) {
        this.rotate = new Parameter("rotate", 1, 0, 1, 1)
        ui.addBooleanParameter(this.rotate);
    }
        

    start() {
        this.graph = this.getIcosahedron();
        this.graph.print();
        this.mesh = graphToMesh(this.graph);
        this.meshRend.set(this.gl, this.mesh);
    }

    update(state: InputState) {
        this.camera.update(state);

        // if (!state.mouseRightDown && this.rotate.get() == 1) {
        //     let alpha = 0.0002 * state.tick;
        //     let rot = Matrix4.newXRotation(alpha)
        //         .multiply(Matrix4.newYRotation(alpha))
        //         .multiply(Matrix4.newZRotation(alpha));
        //     this.mesh!.transform(rot);
        //     this.meshRend.set(this.gl, this.mesh);
        // }
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.meshRend.render(gl, this.camera);
    }
}

function graphToMesh(graph: Graph) : RenderMesh {
        
    let meshes: PureMesh[] = [];
    let radius = 0.05;
    let detail = 6;

    graph.getVertRenderData().forEach((v) => {
        meshes.push(PureMesh.fromSphere(v, radius*2, detail, detail*2))
    })

    let edges = graph.getEdgeRenderData()
    for (let i = 0 ; i < edges.length; i+=2) {
        let from = edges[i];
        let to = edges[i+1];

        console.log(from, to);

        meshes.push(PureMesh.fromCylinder(from, to, radius, detail))
    }

    let rmesh = PureMesh.fromJoin(meshes).toDisplayMesh();
    rmesh.calculateFaceNormals();
    return rmesh;
} 