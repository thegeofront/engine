
// Mesh.Ts
// Purpose: obj class for dealing with that specific filetype, and meshes in general
// Author: Jos Feenstra

import { createUnsignedBytesMatrixTexture } from "@tensorflow/tfjs-backend-webgl/dist/gpgpu_util";
import { browserLocalStorage } from "@tensorflow/tfjs-core/dist/io/local_storage";
import { IntMatrix } from "../data/int-matrix";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Vector2, Vector3 } from "../math/vector";
import { Cube } from "./cube";
import { Rectangle3 } from "./rectangle";


// TODO make distinctions between
// - PureMesh (only verts & links)
// - NavMesh | TopoMesh (mesh which is topologically sound) 
// - DisplayMesh (PureMesh + uvs, texture, normals, material, etc...)


// a very pure idea of a mesh : Vertices + links between vertices. 
// Could be anything with these properties.
export class Mesh {

    verts: Vector3Array;
    links: IntMatrix; // relationships, can be 2 (lines) | 3 (triangles) | 4 (quads)

    constructor(verts: Vector3Array, links: IntMatrix) {
        this.verts = verts;
        this.links = links;
    }


    static fromLists(verts: Vector3[], faces: number[]) : Mesh {
        return new Mesh(
            Vector3Array.fromList(verts), 
            IntMatrix.fromList(faces, 3)
        );
    }


    static fromEmpty() : Mesh {
        return new Mesh(new Vector3Array(0), new IntMatrix(0,0));
    }


    static fromJoin(meshes: Mesh[]) : Mesh {

        // join meshes, dont try to look for duplicate vertices
        // TODO : make this the trouble of Matrices and Arrays
        let vertCount = 0;
        let faceCount = 0;

        for (let mesh of meshes) {
            vertCount += mesh.verts.count();
            faceCount += mesh.links.count();
        }

        let verts = new Vector3Array(vertCount);
        let links = new IntMatrix(faceCount, 3);

        let accVerts = 0;
        let accFaces = 0;

        for (let mesh of meshes) {
            for (let i = 0 ; i < mesh.verts.count(); i++) {
                verts.setVector(accVerts + i, mesh.verts.getVector(i));
            }
            for (let i = 0 ; i < mesh.links.count(); i++) {
                let face = mesh.links.getRow(i);
                for (let j = 0 ; j < face.length; j++) {
                    face[j] = face[j] + accVerts;
                }
                links.setRow(accFaces + i, face);
            }
            accVerts += mesh.verts.count();
            accFaces += mesh.links.count();
        }

        return new Mesh(verts, links);
    }


    static fromCube(cube: Cube) : Mesh {

        let verts = cube.getCorners();
        let faces: number[] = []
        for(let face of cubeFaces) {
            faces.push(...quadToTri(face));
        }

        return this.fromLists(verts, faces);
    }


    static fromSphere(center: Vector3, radius: number, numRings: number, numPerRing: number) : Mesh {

        
        // verts
        let vertCount = numRings * numPerRing + 2;
        let verts = new Vector3Array(vertCount);
        let setVert = function(i: number, vector: Vector3) {
            verts.setVector(i, vector.scale(radius).add(center));
        }

        setVert(0, new Vector3(0,0,1));
        for (let ring = 0; ring < numRings; ring++)
        {
            for (let perRing = 0; perRing < numPerRing; perRing++)
            {
                let alpha = Math.PI * (ring+1) / (numRings+1);
                let beta = 2 * Math.PI * perRing/numPerRing;

                let x = Math.sin(alpha)
                      * Math.cos(beta);
                let y = Math.sin(alpha) 
                      * Math.sin(beta);
                let z = Math.cos(alpha);

                let index = 1 + ring * numPerRing + perRing;
                setVert(index, new Vector3(x, y, z));
            }
        }
        setVert(vertCount-1, new Vector3(0,0,-1));
        
        // faces 
        let faceCount = numPerRing * (numRings) * 2;
        let links = new IntMatrix(faceCount, 3);
        links.fill(-1);
        let setFace = function(i: number, row: number[]) {
            links.setRow(i, row);
        }

        // faces top
        for (let i = 0; i < numPerRing; i++) {
            setFace(i, [
                0,
                i+1,
                (i+1) % numPerRing + 1
            ]);
        }

        // faces middle
         // we are at this cursor
        // console.log("faces", faceCount);

        for (let ring = 0; ring < numRings-1; ring++) {

            let vertCursor = numPerRing * ring + 1;
            let vertCursorBelow = vertCursor + numPerRing;

            for (let perRing = 0; perRing < numPerRing; perRing++) {
                let a = vertCursor + perRing;
                let b = vertCursor + ((perRing + 1) % numPerRing);

                let c = vertCursorBelow + perRing;
                let d = vertCursorBelow + ((perRing + 1) % numPerRing);

                let iFace = numPerRing + (numPerRing * ring * 2) + perRing * 2
                
                // console.log(iFace);
                setFace(iFace, [a,c,b]);
                setFace(iFace+1, [c,d,b]);
            }
        }

        // faces bottom 
        for (let i = 0; i < numPerRing; i++) {

            let iNext = ((i+1) % numPerRing);
            let last = vertCount - 1;

            let iFace = faceCount - numPerRing + i;

            let zero = vertCount - numPerRing - 1;
            let vertI = zero + i;
            let vertINext = zero + iNext;

            // console.log(iFace);
            // console.log("face", last, vertINext, vertI);

            setFace(iFace,[
                last,
                vertINext,
                vertI,
            ]);
        }

        return new Mesh(verts, links);
    }


    static fromCone(center: Vector3, radius: number, height: number, numPerRing: number) {

        let numVerts = numPerRing + 2;
        let numFaces = numPerRing * 2;
        let verts = new Vector3Array(numVerts);
        let setVert = function(i: number, vector: Vector3) {
            verts.setVector(i, vector.add(center));
        }
        let links = new IntMatrix(numFaces, 3);
        links.fill(-1);
        let setFace = function(i: number, row: number[]) {
            links.setRow(i, row);
        }

        // set verts
        setVert(0, new Vector3(0,0,0)); 
        for (let i = 0; i < numPerRing; i++) {
            setVert(i+1, new Vector3(
                Math.cos(Math.PI * 2 * i / numPerRing),
                Math.sin(Math.PI * 2 * i / numPerRing),
            0).scale(radius))
        }
        setVert(numVerts-1, new Vector3(0,0,height));

        // set faces 
        for (let i = 0; i < numPerRing; i++) {
            
            let a = 0;
            let b = numVerts-1;
            let c = 1 + i;
            let d = 1 + ((i+1) % numPerRing)
            
            setFace(i*2, [a,c,d]);
            setFace(i*2+1, [c,b,d]);
        }


        return new Mesh(verts, links);
    }

    // TODO fix this later
    toDisplayMesh() : DisplayMesh {
        let mesh = new DisplayMesh(this.verts.count(), 0, 0, this.links.count());
        mesh.verts.data = this.verts.data;
        mesh.links.data = this.links.data;
        return mesh;
    }
}


export class DisplayMesh {

    verts: Vector3Array; // 3 long float
    norms: Vector3Array; // 3 long float
    uvs:   Vector2Array; // 2 long float 
    links: IntMatrix; // 3 width, count height integers

    texture?: ImageData = undefined;

    constructor(vertCount: number, normCount: number, uvCount: number, faceCount: number, texture: ImageData | undefined = undefined) {
        this.verts = new Vector3Array(vertCount);
        this.norms = new Vector3Array(normCount);
        this.uvs = new Vector2Array(uvCount);
        this.links = new IntMatrix(faceCount, 3);
        this.links.fill(-1);
        this.texture = texture;
    }


    static fromData(verts: number[], norms: number[], uvs: number[], faces: number[]) : DisplayMesh {
        
        // NOTE : this type of parsing makes my life easy, but is dangerous. This is why i created the 
        // Array class. 
        let mesh = new DisplayMesh(verts.length / 3, norms.length / 3, uvs.length / 2, faces.length / 3);
        mesh.verts.fillWith(verts);
        mesh.norms.fillWith(norms);
        mesh.uvs.fillWith(uvs);
        mesh.links.fillWith(faces);
        return mesh;
    }


    static fromRect(rect: Rectangle3) : DisplayMesh {

        let verts = rect.getCorners();

        // we cant handle quads yet 
        let faces: number[] = []
        faces.push(...quadToTri(cubeFaces[0]));
        let mesh = new DisplayMesh(4, 0, 0, 2);
        mesh.verts.fillFromList(verts);
        mesh.links.setData(faces);

        // console.log(mesh.verts);
        // console.log(mesh.links);

        mesh.setUvs(new Float32Array([
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0])
            );
        return mesh;
    }


    static fromJoin(meshes: DisplayMesh[]) : DisplayMesh {

        // join meshes, dont try to look for duplicate vertices
        // TODO : make this the trouble of Matrices and Arrays
        let vertCount = 0;
        let faceCount = 0;
        for (let mesh of meshes) {
            vertCount += mesh.verts.count();
            faceCount += mesh.links.count();
        }

        let joined = new DisplayMesh(vertCount, 0, 0, faceCount);

        let accVerts = 0;
        let accFaces = 0;
        for (let mesh of meshes) {
            for (let i = 0 ; i < mesh.verts.count(); i++) {
                joined.verts.setVector(accVerts + i, mesh.verts.getVector(i));
            }
            for (let i = 0 ; i < mesh.links.count(); i++) {
                let face = mesh.links.getRow(i);
                for (let j = 0 ; j < face.length; j++) {
                    face[j] = face[j] + accVerts;
                }
                joined.links.setRow(accFaces + i, face);
            }
            accVerts += mesh.verts.count();
            accFaces += mesh.links.count();
        }

        return joined;
    }


    setTexture(texture: ImageData) {
        this.texture = texture;
        // recalculate things if needed
    }


    setUvs(uvs: Vector2Array | Float32Array) {
        if (uvs instanceof Float32Array) {
            this.uvs.data = uvs;
        } else {
            this.uvs = uvs;
        }
        
        // recalculate if needed
    }
    
    exportToObj(path: string) {
        throw "todo";
    }


    
};

// ================ Help ==================

// 0 ------- 1
// | \     / |
// |  4---5  |
// |  |   |  |
// |  6---7  |
// | /     \ |
// 2 ------- 3
const cubeFaces = [
    [0,1,3,2], // front 
    [4,0,2,6], // left
    [1,0,4,5], // top
    [1,5,7,3], // right
    [2,3,7,6], // bottom
    [5,4,6,7], // back
];

function quadToTri(abcd: number[]) : number[] {
    return [
        abcd[0], abcd[1], abcd[2], 
        abcd[0], abcd[2], abcd[3]
    ]
}

// ================ Obj ===================

export function meshFromObj(text: string) : DisplayMesh {

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
    // console.log("number of vertices: " + verts.length / 3);
    // console.log("number of faces: " + faces.length / 3);
    // console.log("number of uvs: " + uvs.length / 2);
    // console.log("number of norms: " + norms.length / 3);

    let mesh = DisplayMesh.fromData(verts, norms, uvs, faces);
  
    return mesh;
}

// NOTE: for now, uv and normals are completely ignored!!!
// we assume the indices are the same als the vertices!!!
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

