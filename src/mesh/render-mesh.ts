import { IntMatrix } from "../data/int-matrix";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Vector2, Vector3 } from "../math/vector";
import { Cube } from "../geo/cube";
import { Rectangle3 } from "../geo/rectangle";

// a mesh with the ability to be rendered 
export class RenderMesh {

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


    static fromData(verts: number[], norms: number[], uvs: number[], faces: number[]) : RenderMesh {
        
        // NOTE : this type of parsing makes my life easy, but is dangerous. This is why i created the 
        // Array class. 
        let mesh = new RenderMesh(verts.length / 3, norms.length / 3, uvs.length / 2, faces.length / 3);
        mesh.verts.fillWith(verts);
        mesh.norms.fillWith(norms);
        mesh.uvs.fillWith(uvs);
        mesh.links.fillWith(faces);
        return mesh;
    }


    static fromJoin(meshes: RenderMesh[]) : RenderMesh {

        // join meshes, dont try to look for duplicate vertices
        // TODO : make this the trouble of Matrices and Arrays
        let vertCount = 0;
        let faceCount = 0;
        for (let mesh of meshes) {
            vertCount += mesh.verts.count();
            faceCount += mesh.links.count();
        }

        let joined = new RenderMesh(vertCount, 0, 0, faceCount);

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


// ================ Obj ===================

export function meshFromObj(text: string) : RenderMesh {

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

    let mesh = RenderMesh.fromData(verts, norms, uvs, faces);
  
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

