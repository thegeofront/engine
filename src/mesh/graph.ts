// name: graph.ts
// author:  Jos Feenstra
// purpose: HalfEdge Mesh in 3D. 
// This does mean that the order around a vertex is not staight forward, and must be handled using normals.

import { Matrix4 } from "../math/matrix";
import { Vector3 } from "../math/vector";
import { Mesh } from "./mesh";

type EdgeIndex = number;
type VertIndex = number;

type Vert = {
    data: Vector3,
    //normal: Vector3,
    edge: EdgeIndex,
}

interface Edge {   
    next: EdgeIndex,
    twin: EdgeIndex,
    vert: VertIndex,
}

// NOTE: create an interface which hides the Edge, Vert & Face interfaces. 
// NOTE: half edge is implied
export class Graph {

    private verts: Vert[];
    private edges: Edge[]; // NOTE: ALWAYS AN EVEN NUMBER OF EDGES. EDGE TWIN IS EVEN / UNEVEN MATCH

    constructor() {
        this.verts = [];
        this.edges = [];
    }


    static new() {
        return new Graph();
    }


    static fromMesh(mesh: Mesh) : Graph {
        
        let graph = Graph.new();

        mesh.verts.forEach((v, i) => {
            graph.addVert(v);
        });

        let width = mesh.links._width;
        mesh.links.forEachRow((row, i) => {

            // go through pairs
            for (let i = 0; i < width; i++) {
                let iNext = (i + 1) % width;

                if (i < iNext) {

                }
            }
        })

        return graph;
    }


    // geometry trait 

    clone() {
        throw new Error("not yet implemented...");
    }

    transform(matrix: Matrix4) {

        for (let i = 0 ; i < this.verts.length; i++) {

            let v = this.verts[i];
            v.data = matrix.multiplyVector(v.data);
        }
    }

    // util

    print() {
        console.log("graph")
        console.log("--------")
        console.log(`${this.verts.length} verts: `)
        for (let i = 0 ; i < this.verts.length; i++) {
            let v = this.verts[i];
            console.log(`v(${i}) | edge: ${v.edge}, data: ${v.data.toString()} `);
        }

        console.log("--------")
        console.log(`${this.edges.length} edges:  `)
        for (let i = 0; i < this.edges.length; i++) {
            let e = this.edges[i];
            console.log(`e(${i}) | vert: ${e.vert} | twin: ${e.twin}, next: ${e.next}`)
        }
        console.log("--------")
    }

    // conversion

    toMesh() : Mesh {
        return Mesh.fromGraph(this);
    }


    // public getters

    allVerts() : Vector3[] {
        let data: Vector3[] = [];
        this.verts.forEach((v) => {
            data.push(v.data);
        })
        return data;
    }


    allEdges() : VertIndex[] {
        let data: VertIndex[] = [];
        let edges = new Map<number, number>()
        this.edges.forEach((e, i) => {
            if (edges.has(i)) {
                return;
            }
            data.push(e.vert);
            data.push(this.getEdge(e.twin).vert);
            edges.set(e.twin, e.twin);
        })
        return data;
    }


    allLoops() : VertIndex[][] {

        let loops: VertIndex[][] = [];
        let unvisited = new Set<number>()
        this.edges.forEach((e, i) => {
            unvisited.add(i);
        })

        while(unvisited.size > 0) {
            let loop: VertIndex[] = [];
            
            let ei = unvisited.entries().next().value[0];
            let start = ei;
            do {
                let e = this.getEdge(ei);
                ei = e.next;
                unvisited.delete(ei);
                loop.push(e.vert);

            } while(ei != start);

            loops.push(loop);
        }

        return loops;
    }


    getVertex(vi: VertIndex) : Vector3 {
        if (vi < 0 || vi >= this.verts.length) {
            throw "out of range";
        }
        return this.verts[vi].data;
    }


    // getters


    private getVert(vi: VertIndex) : Vert {
        if (vi < 0 || vi >= this.verts.length) {
            throw "out of range";
        }
        return this.verts[vi];
    }


    private getEdge(ei: EdgeIndex) : Edge {
        if (ei < 0 || ei >= this.edges.length) {
            console.error("out of range");
        }
        return this.edges[ei];
    }


    private getVertEdgeFan(vi : VertIndex) : Edge[] {

        // get all edges connected to this vertex.
        // NOTE: all are outgoing (e.vert == vi)

        let fan: Edge[] = [];
        let v = this.verts[vi];
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
        let v = this.verts[vi];
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
        return this.edges[this.edges[ei].twin];
    }


    // public  setters

    
    addVert(vector: Vector3) {
        this.verts.push({data: vector, edge: -1});
    }


    addEdge(vi_1: VertIndex, vi_2: VertIndex, normal: Vector3) {
        
        //             ei1
        // / vi1 \  ---------> / vi2 \
        // \     / <---------  \     /
        //             ei2

        let ei_1 = this.edges.length;
        let ei_2 = ei_1 + 1;

        this.edges.push({
            next: -1,
            twin: ei_2,
            vert: vi_1,
        });
        this.edges.push({
            next: -1,
            twin: ei_1,
            vert: vi_2,
        });

        // make sure the 'next' things are fixed, and more
        this.addEdgeToDisk(vi_1, ei_1, normal);
        this.addEdgeToDisk(vi_2, ei_2, normal);
    }


    // private setters


    private addEdgeToDisk(vi: VertIndex, ei: EdgeIndex, normal: Vector3) {
        
        let v = this.getVert(vi)!;
        let twin = this.getEdgeTwin(ei)
        if (v.edge == -1) {
            // set two pointers:
            v.edge = ei; // I am the vertex's first edge
            twin.next = ei; // that means my twin points back to me 
        } else {
            
            // console.log("Doing complitated things around vertex", vi);

            // determine where this edge joins the Disk
            let v_twin = this.verts[twin.vert];
            let myVector = v.data.subbed(v_twin.data);

            // get all vectors
            let vectors: Vector3[] = [];
       
            // get more vectors by getting all edges currently connected to vertex v
            let edges = this.getVertEdgeFan(vi);
            
            //console.log("edges", edges);

            edges.forEach((edge) => {
                let twin = this.getEdge(edge.twin);
                let neighbor = this.verts[twin.vert];
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
            let e_before = edges[order[order.length-1]];
            let e_after = edges[order[0]];
            
            //console.log("ei_before", this.getEdgeIndex(e_before), "ei_after", this.getEdgeIndex(e_after));
 
            // set two pointers: 
            this.getEdge(e_before.twin).next = ei;
            twin.next = this.getEdgeIndex(e_after); 
        }
    }
}