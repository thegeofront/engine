
// Mesh.Ts
// Purpose: obj class for dealing with that specific filetype, and meshes in general
// Author: Jos Feenstra

import { Renderer } from "../draw/Renderer";

export class Mesh {

    verts: number[][] = []; // 3 long float
    norms: number[][] = []; // 3 long float
    uvs:   number[][] = []; // 2 long float 
    faces: number[][] = []; // 3 long int

    lastTouched: number = 0; // int , needed for triangle walk

    constructor() {}

    export_to_file(path: string) {
        
    }

    set_all_neighbours() {

    }
};

// simple wrapper
class Face {

    a: number;
    b: number;
    c: number;

    constructor(a: number, b: number, c: number)
    {
        this.a = a;
        this.b = b;
        this.c = c;
    }
};

export async function loadMeshFromObjFile(file: File) : Promise<Mesh> {
    
    let mesh = new Mesh();

    // let reader = new FileReader


    return mesh;
}
