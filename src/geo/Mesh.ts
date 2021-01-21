
// Mesh.Ts
// Purpose: obj class for dealing with that specific filetype, and meshes in general
// Author: Jos Feenstra

import { createUnsignedBytesMatrixTexture } from "@tensorflow/tfjs-backend-webgl/dist/gpgpu_util";
import { browserLocalStorage } from "@tensorflow/tfjs-core/dist/io/local_storage";
import { FaceArray, Vector2Array, Vector3Array } from "../math/array";

export class Mesh {

    verts: Vector3Array; // 3 long float
    norms: Vector3Array; // 3 long float
    uvs:   Vector2Array; // 2 long float 
    faces: FaceArray;

    lastTouched: number = 0; // needed for triangle walk
    texture?: ImageData = undefined;

    constructor(vertCount: number, normCount: number, uvCount: number, faceCount: number, texture: ImageData | undefined = undefined) {
        this.verts = new Vector3Array(vertCount);
        this.norms = new Vector3Array(normCount);
        this.uvs = new Vector2Array(uvCount);
        this.faces = new FaceArray(faceCount);
        this.texture = texture;
    }

    static fromData(verts: number[], norms: number[], uvs: number[], faces: number[]) : Mesh {
        
        // NOTE : this type of parsing makes my life easy, but is dangerous. This is why i created the 
        // Array class. 
        let mesh = new Mesh(verts.length / 3, norms.length / 3, uvs.length / 2, faces.length / 3);
        mesh.verts.fillWith(verts);
        mesh.norms.fillWith(norms);
        mesh.uvs.fillWith(uvs);
        mesh.faces.fillWith(faces);
        return mesh;
    }


    exportToObj(path: string) {
        
    }

    setNeighbors() {

    }

    getLineIds() : Uint16Array {
        // 3 edges per face, 2 indices per edge
        let count = this.faces.count() * 6;
        let data = new Uint16Array(count);
        for (let i = 0 ; i < this.faces.count(); i++) {
            
            let iData = i * 6;
            data[iData]   = this.faces.get(i, 0);
            data[iData+1] = this.faces.get(i, 1);
            data[iData+2] = this.faces.get(i, 1);
            data[iData+3] = this.faces.get(i, 2);
            data[iData+4] = this.faces.get(i, 2);
            data[iData+5] = this.faces.get(i, 0);
        }
        return data;
    }
};

// ================ Obj ===================

export function meshFromObj(text: string) : Mesh {

    // This is not a full .obj parser.
    // see http://paulbourke.net/dataformats/obj/
    // INDEXES ORIGINALLY REFER TO LINES, so -1 is needed

    // run through all lines, and temporarely store
    // all data in raw number lists, since we dont know how 
    // many vertices or faces well get. 
    let verts: number[] = []; // 3 long float
    let norms: number[] = []; // 3 long float
    let uvs:   number[] = []; // 2 long float 
    let faces: number[] = []; // 9 long ints, u16's should suffice. 
    
    // note : this is very inefficient, but it'll have to do for now...
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i].trim();

        // filter out comments
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        
        switch(keyword) {
            case 'v':
                for (const part of parts) {
                    verts.push(parseFloat(part));
                }
                break;
            case 'vn':
                for (const part of parts) {
                    norms.push(parseFloat(part));
                }
                break;
            case 'vt':
                for (const part of parts) {
                    uvs.push(parseFloat(part));
                }
                break;
            case 'f':
                for (const value of ProcessObjFace(parts)) {
                    faces.push(value);
                }
                break;
            default:
                console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
                continue;
        }
    }
    console.log("number of vertices: " + verts.length / 3);
    console.log("number of faces: " + faces.length / 3);
    let mesh = Mesh.fromData(verts, norms, uvs, faces);
    
    return mesh;
}

// verbose way of processing one single vertex/normal/uv combination in a face. 
function ProcessObjFaceVertex(part: string) : number[] {

    // make sure data always has length: 3
    let data: number[] = [];
    
    // cut string apart and process it
    let subparts = part.split('/');
    if (subparts.length == 1) {
        data.push(parseInt(subparts[0])-1);
        // data.push(0);
        // data.push(0);
    } else if (subparts.length == 3) {
        data.push(parseInt(subparts[0])-1);
        // data.push(parseInt(subparts[1])-1);
        // data.push(parseInt(subparts[2])-1);
    } else {
        throw "invalid face found when processing";
    }
    return data;
}

// process a face entry in an obj file
function ProcessObjFace(parts: string[]) : number[] {
    
    let data: number[] = [];

    if (parts.length == 4) {
        // i dont want to deal with quads for now, create 2 faces from a quad
        let a = ProcessObjFaceVertex(parts[0]);
        let b = ProcessObjFaceVertex(parts[1]);
        let c = ProcessObjFaceVertex(parts[2]);
        let d = ProcessObjFaceVertex(parts[3]);

        data.push(...a, ...b, ...c, ...a, ...c, ...d);

    } else if (parts.length == 3) {
        // as normal        
        let a = ProcessObjFaceVertex(parts[0]);
        let b = ProcessObjFaceVertex(parts[1]);
        let c = ProcessObjFaceVertex(parts[2]);
        data.push(...a, ...b, ...c);
    }

    // data always has length 9 or 18
    return data;
}

