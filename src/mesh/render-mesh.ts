// Name: render-mesh.ts
// Author: Jos Feenstra
// Purpose:
// a mesh representation with the sole purpose of to be renderer.
// - fixed length attributes
// - can represent:
//   - pointcloud (links = null)
//   - graph (links.width = 2)
//   - triangles (links.width = 3)
//   - quads (links.width = 4. will need to be converted to triangles)

import { IntMatrix } from "../data/int-matrix";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Vector2, Vector3 } from "../math/vector";
import { Cube } from "../geo/cube";
import { Rectangle3 } from "../geo/rectangle";
import { Matrix4 } from "../math/matrix";
import { Mesh } from "./mesh";
import { Graph } from "./graph";

type vertexID = number;
type faceID = number;

export enum MeshType {
    Invalid = 0,
    Points = 1,
    Lines = 2,
    Triangles = 3,
    Quads = 4,
}

export enum NormalKind {
    None,
    Vertex,
    Face,
    MultiVertex,
}

export class Renderable {
    mesh: Mesh;

    norms: Vector3Array;
    uvs: Vector2Array;
    ambi: Float32Array;
    texture?: ImageData;

    _normKind: NormalKind = NormalKind.None;

    // render speed
    // shader
    color = [1, 1, 1, 1];

    constructor(
        vertCount: number,
        normCount: number,
        uvCount: number,
        faceCount: number,
        texture: ImageData | undefined = undefined,
    ) {
        let perFaceCount = 3;
        this.mesh = Mesh.newEmpty(vertCount, faceCount, perFaceCount);
        this.norms = new Vector3Array(normCount);
        this.uvs = new Vector2Array(uvCount);
        this.ambi = new Float32Array(vertCount);
        this.texture = texture;
    }

    static new(
        vertCount: number,
        normCount: number,
        uvCount: number,
        faceCount: number,
        texture: ImageData | undefined = undefined,
    ) {
        return new Renderable(vertCount, normCount, uvCount, faceCount, texture);
    }

    static fromMesh(mesh: Mesh): Renderable {
        let r = new Renderable(mesh.verts.count(), 0, 0, mesh.links.count());
        r.mesh.verts.data = mesh.verts.data;
        r.mesh.links.data = mesh.links.data;
        return r;
    }

    static fromData(verts: number[], norms: number[], uvs: number[], faces: number[]): Renderable {
        // NOTE : this type of parsing makes my life easy, but is dangerous. This is why i created the
        // Array class.
        let r = new Renderable(
            verts.length / 3,
            norms.length / 3,
            uvs.length / 2,
            faces.length / 3,
        );
        r.mesh.verts.fillWith(verts);
        r.mesh.links!.fillWith(faces);
        r.norms!.fillWith(norms);
        r.uvs!.fillWith(uvs);

        return r;
    }

    static fromGraph(graph: Graph) {
        let mesh = graph.toMesh();
        let r = Renderable.fromMesh(mesh);
        r.norms = Vector3Array.fromList(graph.allNorms());
        r._normKind = NormalKind.Vertex; // fix this!!
        return r;
    }

    // geometry trait

    transform(matrix: Matrix4) {
        for (let i = 0; i < this.mesh.verts.count(); i++) {
            let v = this.mesh.verts.getVector(i);
            let n = this.norms.getVector(i);
            this.mesh.verts.setVector(i, matrix.multiplyVector(v));
            this.norms.setVector(i, matrix.multiplyVector(n)); // TODO, EXTRACT ONLY ROTATION PART FROM THE MATRIX
        }
    }

    // getters & selectors

    // VERY POORLY OPTIMIZED
    getAdjacentFaces(v: vertexID): faceID[] {
        let faces: faceID[] = [];
        let count = this.mesh.links.count();
        for (let i = 0; i < count; i++) {
            if (this.mesh.links.getRow(i).includes(v)) {
                faces.push(i);
            }
        }
        return faces;
    }

    getFaceVertices(f: faceID): Vector3Array {
        return this.mesh.getLinkVerts(f);
    }

    getType(): MeshType {
        return this.mesh.getType();
    }

    getNormalType(): NormalKind {
        return this._normKind;
    }

    // setters

    setTexture(texture: ImageData) {
        this.texture = texture;
        // recalculate things if needed
    }

    setUvs(uvs: Vector2Array | Float32Array) {
        if (uvs instanceof Float32Array) {
            this.uvs!.data = uvs;
        } else {
            this.uvs = uvs;
        }

        // recalculate if needed
    }

    // convert
    exportToObj(path: string) {
        throw "todo";
    }

    // ------ normals ------

    // set 1 normal per face
    calculateFaceNormals() {
        if (this.getType() != MeshType.Triangles) {
            console.error("can only calculate normals from triangular meshes");
            this.norms = new Vector3Array(0);
            return;
        }
        let norms = this.mesh.calculateFaceNormals();
        this.norms = Vector3Array.fromList(norms);
        this._normKind = NormalKind.Face;
    }

    calculateVertexNormals() {
        let norms = this.mesh.calculateVertexNormals();
        this.norms = Vector3Array.fromList(norms);
        this._normKind = NormalKind.Vertex;
    }

    calculateMultiVertexNormals() {
        // set type
        this._normKind = NormalKind.MultiVertex;

        // calculate
        this.calculateFaceNormals();
        let vertNormals = new Vector3Array(this.mesh.verts.count());
        this.mesh.verts.forEach((v, i) => {
            let adjFaces = this.getAdjacentFaces(i);
            vertNormals.setVector(i, this.norms.take(adjFaces).average());
        });

        this.norms = vertNormals;
    }
}

// ================ Obj ===================

export function meshFromObj(text: string): Renderable {
    // This is not a full .obj parser.
    // see http://paulbourke.net/dataformats/obj/
    // INDEXES ORIGINALLY REFER TO LINES, so -1 is needed

    // run through all lines, and temporarely store
    // all data in raw number lists, since we dont know how
    // many vertices or faces well get.
    let verts: number[] = []; // 3 long float
    let norms: number[] = []; // 3 long float
    let uvs: number[] = []; // 2 long float
    let faces: number[] = []; // 9 long ints, u16's should suffice.

    // note : this is very inefficient, but it'll have to do for now...
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i].trim();

        // filter out comments
        if (line === "" || line.startsWith("#")) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);

        switch (keyword) {
            case "v":
                for (const part of parts) {
                    verts.push(parseFloat(part));
                }
                break;
            case "vn":
                for (const part of parts) {
                    norms.push(parseFloat(part));
                }
                break;
            case "vt":
                for (const part of parts) {
                    uvs.push(parseFloat(part));
                }
                break;
            case "f":
                for (const value of ProcessObjFace(parts)) {
                    faces.push(value);
                }
                break;
            default:
                console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
                continue;
        }
    }
    // console.log("number of vertices: " + verts.length / 3);
    // console.log("number of faces: " + faces.length / 3);
    // console.log("number of uvs: " + uvs.length / 2);
    // console.log("number of norms: " + norms.length / 3);

    let mesh = Renderable.fromData(verts, norms, uvs, faces);

    return mesh;
}

// NOTE: for now, uv and normals are completely ignored!!!
// we assume the indices are the same als the vertices!!!
// verbose way of processing one single vertex/normal/uv combination in a face.
function ProcessObjFaceVertex(part: string): number[] {
    // make sure data always has length: 3
    let data: number[] = [];

    // cut string apart and process it
    let subparts = part.split("/");
    if (subparts.length == 1) {
        data.push(parseInt(subparts[0]) - 1);
        // data.push(0);
        // data.push(0);
    } else if (subparts.length == 3) {
        data.push(parseInt(subparts[0]) - 1);
        // data.push(parseInt(subparts[1])-1);
        // data.push(parseInt(subparts[2])-1);
    } else {
        throw "invalid face found when processing";
    }
    return data;
}

// process a face entry in an obj file
function ProcessObjFace(parts: string[]): number[] {
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
