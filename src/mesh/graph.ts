// name: graph.ts
// author:  Jos Feenstra
// purpose: HalfEdge Mesh in 3D. 
// This does mean that the order around a vertex is not staight forward, and must be handled using normals.

import { Matrix4 } from "../math/matrix";
import { Vector3 } from "../math/vector";
import { PureMesh } from "./pure-mesh";

type EdgeIndex = number;
type VertIndex = number;

type Vert = {
    data: Vector3,
    edge: EdgeIndex,
}

interface Edge {   
    next: EdgeIndex,
    twin: EdgeIndex,
    vert: VertIndex,
}


type Face = EdgeIndex;


// NOTE: create an interface which hides the Edge, Vert & Face interfaces. 
// NOTE: half edge is implied
export class Graph {

    private _verts: Vert[];
    private _edges: Edge[]; // NOTE: ALWAYS AN EVEN NUMBER OF EDGES. EDGE TWIN IS EVEN / UNEVEN MATCH
    private _faces: Face[]; 


    constructor() {
        this._verts = [];
        this._edges = [];
        this._faces = [];
    }


    static fromMesh() {
        
    }


    // geometry trait 

    clone() {
        throw new Error("not yet implemented...");
    }

    transform(matrix: Matrix4) {

        for (let i = 0 ; i < this._verts.length; i++) {

            let v = this._verts[i];
            v.data = matrix.multiplyVector(v.data);
        }
    }

    // util

    print() {
        console.log("graph")
        console.log("--------")
        console.log(`${this._verts.length} verts: `)
        for (let i = 0 ; i < this._verts.length; i++) {
            let v = this._verts[i];
            console.log(`v(${i}) | edge: ${v.edge}, data: ${v.data.toString()} `);
        }

        console.log("--------")
        console.log(`${this._edges.length} edges:  `)
        for (let i = 0; i < this._edges.length; i++) {
            let e = this._edges[i];
            console.log(`e(${i}) | vert: ${e.vert} | twin: ${e.twin}, next: ${e.next}`)
        }
        console.log("--------")
    }

    // conversion

    toMesh() : PureMesh {
        return PureMesh.fromGraph(this);
    }


    // public getters

    allVerts() : Vector3[] {
        let data: Vector3[] = [];
        this._verts.forEach((v) => {
            data.push(v.data);
        })
        return data;
    }


    allEdges() : VertIndex[] {
        let data: VertIndex[] = [];
        let edges = new Map<number, number>()
        this._edges.forEach((e, i) => {
            if (edges.has(i)) {
                return;
            }
            data.push(e.vert);
            data.push(this.getEdge(e.twin).vert);
            edges.set(e.twin, e.twin);
        })
        return data;
    }


    allFaces() : VertIndex[][] {
        throw "nope";
    }


    getVertex(vi: VertIndex) : Vector3 {
        if (vi < 0 || vi >= this._verts.length) {
            throw "out of range";
        }
        return this._verts[vi].data;
    }


    // getters


    private getVert(vi: VertIndex) : Vert {
        if (vi < 0 || vi >= this._verts.length) {
            throw "out of range";
        }
        return this._verts[vi];
    }


    private getEdge(ei: EdgeIndex) : Edge {
        if (ei < 0 || ei >= this._edges.length) {
            console.error("out of range");
        }
        return this._edges[ei];
    }


    private getVertEdgeFan(vi : VertIndex) : Edge[] {

        // get all edges connected to this vertex.
        // NOTE: all are outgoing (e.vert == vi)

        let fan: Edge[] = [];
        let v = this._verts[vi];
        let ei = v.edge;
        let start = ei;

        while(true) {

            let e = this.getEdge(ei);
            let e_twin = this.getEdgeTwin(ei);
            fan.push(e);
            ei = e_twin.next;

            if (ei == start) {
                break;
            }
        }

        return fan;
    }


    private getVertNeighbors(vi : VertIndex) : VertIndex[] {
        let nbs: VertIndex[] = [];
        let v = this._verts[vi];
        let ei = v.edge;
        let start = ei;

        while(true) {

            let e_twin = this.getEdgeTwin(ei);
            nbs.push(e_twin.vert);
            let next = e_twin.next;

            if (ei == start) {
                break;
            }
        }

        return nbs;
    }


    private getEdgeIndex(e: Edge) {
        return this.getEdge(e.twin).twin
    }


    private getEdgeTwin(ei: EdgeIndex) : Edge {
        return this._edges[this._edges[ei].twin];
    }


    // setters


    addVert(vector: Vector3) {
        this._verts.push({data: vector, edge: -1});
    }


    addEdge(vi_1: VertIndex, vi_2: VertIndex, normal: Vector3) {
        
        //             ei1
        // / vi1 \  ---------> / vi2 \
        // \     / <---------  \     /
        //             ei2

        let ei_1 = this._edges.length;
        let ei_2 = ei_1 + 1;

        this._edges.push({
            next: -1,
            twin: ei_2,
            vert: vi_1,
        });
        this._edges.push({
            next: -1,
            twin: ei_1,
            vert: vi_2,
        });

        // make sure the 'next' things are fixed, and more
        this.addEdgeToDisk(vi_1, ei_1, normal);
        this.addEdgeToDisk(vi_2, ei_2, normal);
    }


    private addEdgeToDisk(vi: VertIndex, ei: EdgeIndex, normal: Vector3) {
        
        let v = this.getVert(vi)!;
        let twin = this.getEdgeTwin(ei)
        if (v.edge == -1) {
            // set two pointers:

            // I am the vertex's first edge
            v.edge = ei;

            // that means my twin points back to me 
            twin.next = ei;
            return;
        } else {
            
            // determine where this edge joins the Disk
            // console.log("Doing complitated things around vertex", vi);

            // get all vectors
            let vectors: Vector3[] = [];

            let v_twin = this._verts[twin.vert];
            let myVector = v.data.subbed(v_twin.data);
       
            // get more vectors by getting all edges currently connected to vertex v
            let edges = this.getVertEdgeFan(vi);
            //console.log("edges", edges);

            edges.forEach((edge) => {
                let twin = this.getEdge(edge.twin);
                let neighbor = this._verts[twin.vert];
                let neighborVector = v.data.subbed(neighbor.data);
                vectors.push(neighborVector);
            });
            //console.log("all vectors: ", vectors);

            // order them by 'wheel'		
            let ihat = myVector;
            let jhat = myVector.cross(normal);
            let order = Vector3.calculateWheelOrder(vectors, ihat, jhat);
            //console.log("order", order);

            // pick. NOTE: IF CCW / CC OF GRAPH NEEDS TO BE CHANGED, CHANGE THIS ORDER 
            let e_after = edges[order[order.length-1]];
            let e_before = edges[order[0]];
            
            //console.log("ei_before", this.getEdgeIndex(e_before), "ei_after", this.getEdgeIndex(e_after));
            
            // set 2 pointers: 
            this.getEdge(e_before.twin).next = ei;
            twin.next = this.getEdgeIndex(e_after); 
        }
    }
}