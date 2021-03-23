// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { GraphModel } from "@tensorflow/tfjs-converter";
import { Vector3 } from "../math/vector";
import { Graph } from "../mesh/graph";
import { Camera } from "../render/camera";
import { GraphRenderer } from "../render/graph-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";

export class GraphApp extends App {

    camera: Camera;
    graphRend: GraphRenderer;

    constructor(gl: WebGLRenderingContext) {
        
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.graphRend = new GraphRenderer(gl);
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


        for (let i = 0 ; i < 12; i+=2) {
            console.log(i);
            let norm = graph.getVertex(i).added(graph.getVertex(i+1)).scale(0.5);
            graph.addEdge(i, i+1, norm);

            let inext = (i + 4) % 12;

            // graph.addEdge(i, inext, norm);
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
        // graph.addVert(new Vector3(0,3,0));

        let normal = new Vector3(0,0,1);
        graph.addEdge(0,1, normal);
        graph.addEdge(0,2, normal);
        graph.addEdge(0,3, normal);
        graph.addEdge(0,4, normal);
        graph.addEdge(1,2, normal);
        //graph.addEdge(3,0, normal);
        // graph.addEdge(0,3, normal);
        return graph
    }

    start() {
        let graph = this.getIcosahedron();
        graph.print();
        this.graphRend.set(this.gl, graph);
    }

    update(state: InputState) {
        this.camera.update(state);
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.graphRend.render(gl, this.camera);
    }
}
