// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { App, Camera, ShadedMeshRenderer, Parameter, Graph, Renderable, Vector3, UI, InputState, Matrix4, DrawSpeed, Mesh } from "../../src/lib";



export class IcosahedronApp extends App {

    camera: Camera;
    meshRend: ShadedMeshRenderer;
    
    rotate!: Parameter;
    inner!: Parameter;
    radius = 0.1; // radius!: Parameter;
    detail = 6; // detail!: Parameter;

    graph!: Graph;
    mesh!: Renderable;

    constructor(gl: WebGLRenderingContext) {
        
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;
        this.camera = new Camera(canvas, 8, true);
        this.meshRend = new ShadedMeshRenderer(gl);
    }

    getIcosahedron() : Graph {
        let graph = new Graph();

        // use golden ratio
        let a = 1;
        let phi = (1 + 5**0.5) / 2
        let b = a * phi;

        // build vertices
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

            addEdge(i+0, inext+2);
            addEdge(i+0, inext+0);
            addEdge(i+1, inext+2);
            addEdge(i+1, inext+0);

            addEdge(i+2, inext+3);
            addEdge(i+2, inext+1);
            addEdge(i+3, inext+3);
            addEdge(i+3, inext+1);
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
        this.inner = new Parameter("inner", 1, 0, 1, 1)
        
        // this.radius = new Parameter("radius", 0.1, 0, 0.5, 0.01)
        // this.detail = new Parameter("detail", 6, 3, 20, 1)
  
        let reset = () => {
            // this.rotate.set(0);
            this.start();
        }

        ui.addBooleanParameter(this.rotate);
        ui.addBooleanParameter(this.inner, reset);
        // ui.addParameter(this.radius, reset);
        // ui.addParameter(this.detail, reset);
        // ui.addButton(() => {this.start()})
    }
        
    start() {
        this.graph = this.getIcosahedron();
        // this.graph.print();
        this.mesh = graphToMultiMesh(this.graph, this.radius, this.detail, this.inner.get() == 1);
        this.meshRend.set(this.gl, this.mesh);

        // console.log("all loops: ", this.graph.allLoops());
    }

    update(state: InputState) {
        this.camera.update(state);

        if (!state.mouseRightDown && this.rotate.get() == 1) {
            let alpha = 0.0002 * state.tick;
            let rot = Matrix4.newXRotation(alpha)
                .multiply(Matrix4.newYRotation(alpha));
            this.mesh!.transform(rot);
            this.meshRend.set(this.gl, this.mesh, DrawSpeed.DynamicDraw);
        }
    }

    draw(gl: WebGLRenderingContext) {
        this.camera.updateMatrices(gl.canvas as HTMLCanvasElement);
        this.meshRend.render(gl, this.camera);
    }
}

function graphToMultiMesh(graph: Graph, radius: number, detail: number, inner: boolean) : Renderable {
        
    let meshes: Mesh[] = [];

    graph.allVerts().forEach((v) => {
        meshes.push(Mesh.newSphere(v, radius*2, detail, detail*2))
    })

    let edges = graph.allEdges()
    for (let i = 0 ; i < edges.length; i+=2) {
        let from = graph.getVertex(edges[i]);
        let to = graph.getVertex(edges[i+1]);
        let mesh = Mesh.newCylinder(from, to, radius, detail);
        meshes.push(mesh);
    }

    if (inner) {
        meshes.push(Mesh.fromGraph(graph));
    }
    
    let rmesh = Mesh.fromJoin(meshes).toRenderable();
    rmesh.calculateFaceNormals();
    return rmesh;
} 