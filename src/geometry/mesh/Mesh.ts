// mesh.ts
// Author: Jos Feenstra
// Purpose:
// NOTE TO SELF: I would rather build a fat Mesh, than to distinquish between pure mesh, a shader mesh, Model, etc. etc.

import {
    BiSurface,
    Cube,
    Domain3,
    getDefaultIndices,
    Graph,
    IntMatrix,
    Matrix4,
    MultiVector2,
    MultiVector3,
    Plane,
    Rectangle3,
    ShaderMesh,
    TriSurface,
    Vector2,
    Vector3,
} from "../../lib";
import { GeonMath } from "../../math/Math";
import { getLongDefaultIndices } from "./MultiLine";

export enum MeshType {
    Invalid = 0,
    Points = 1, // NOTE: we never do this, I think it is wise that we just use MultiVector3's when talking about pointclouds
    Lines = 2, // NOTE: we never do this, I think it is wise that we just use MultiLines's when talking about a bunch of lines
    Triangles = 3,
    Quads = 4,
}

export enum NormalKind {
    None,
    Vertex,
    Face,
    MultiVertex,
}

export class Mesh {
    
    constructor(
        public verts: MultiVector3,
        public _links?: IntMatrix, // relationships, can be 2 (lines) | 3 (triangles) | 4 (quads)
        private _uvs?: MultiVector2,
        private _normals?: MultiVector3, 
        private _normalKind = NormalKind.None
    ) {}

    get maxSize() {
        if (this.links) {
            return this.links.data.length;
        } else {
            return this.verts.count;
        }
    }

    get links() {
        return this._links!;
    }

    get uvs(): MultiVector2 | undefined {
        return this._uvs;
    }

    get normals(): MultiVector3 | undefined {
        return this._normals;
    }

    get normalKind() {
        return this._normalKind;
    }

    setUvs(v: MultiVector2, kind: NormalKind) {
        this._uvs = v;
        this._normalKind = kind;
    }

    setNormals(v: MultiVector3) {
        this._normals = v;
    }

    clone(): Mesh {
        return new Mesh(this.verts.clone(), this.links.clone());
    }

    static new(
        verts: MultiVector3,
        links?: IntMatrix,
        uvs?: MultiVector2,
        normals?: MultiVector3,
    ): Mesh {
        return new Mesh(verts, links, uvs, normals);
    }

    static fromLists(verts: Vector3[], faces: number[], uvs=[], normals=[], normalKind = NormalKind.None): Mesh {
        return new Mesh(MultiVector3.fromList(verts), IntMatrix.fromList(faces, 3), MultiVector2.fromList(uvs), MultiVector3.fromList(normals), normalKind);
    }

    static fromRawLists(verts: number[], faces: number[], uvs: number[], normals: number[], normalKind=NormalKind.None): Mesh {
        
        return new Mesh(MultiVector3.fromData(verts), IntMatrix.fromList(faces, 3), MultiVector2.fromData(uvs), MultiVector3.fromData(normals), normalKind);

    }

    static newEmpty(vertCount: number, linkCount: number, perLinkCount: number): Mesh {
        return new Mesh(MultiVector3.new(vertCount), new IntMatrix(linkCount, perLinkCount));
    }

    static newLines(positions: Vector3[], edges: number[]) {
        let verts = MultiVector3.fromList(positions);
        let links = IntMatrix.fromList(edges, 2);

        return new Mesh(verts, links);
    }

    static fromBiSurface(srf: BiSurface, uSegments = 10, vSegments = 10): Mesh {
        // returns vertices & indices of a flat grid
        let uPoints = uSegments + 1;
        let vPoints = vSegments + 1;

        let verts = MultiVector3.new(uPoints * vPoints);
        let links = new IntMatrix(uSegments * vSegments * 2, 3);

        // create all positions
        for (let u = 0; u < uPoints; u++) {
            for (let v = 0; v < vPoints; v++) {
                let i = u * vPoints + v;
                verts.set(i, srf.pointAt(u / uSegments, v / vSegments));
            }
        }

        // create all indices
        // a---c
        // | \ |
        // b---d
        for (let u = 0; u < uSegments; u++) {
            for (let v = 0; v < vSegments; v++) {
                let start_index = 2 * (u * vSegments + v);
                let a = u * uPoints + v;
                let b = a + vPoints;
                let c = a + 1;
                let d = b + 1;

                links.setRow(start_index, [a, b, d]);
                links.setRow(start_index + 1, [c, a, d]);
            }
        }
        return new Mesh(verts, links);
    }

    static fromTriSurface(srf: TriSurface, segments = 10): Mesh {
        // returns vertices & indices of a flat grid
        let uPoints = segments + 1;

        let verts = MultiVector3.new(GeonMath.stack(uPoints));
        let links = new IntMatrix(GeonMath.stack(uPoints), 3);

        // // create all positions
        // for (let u = 0; u < uPoints; u++) {
        //     for (let v = 0; v < vPoints; v++) {
        //         let i = u * vPoints + v;

        //         verts.set(i, srf.pointAt(u / uSegments, v / vSegments));
        //     }
        // }

        return new Mesh(verts, links);
    }

    static zero(): Mesh {
        return new Mesh(MultiVector3.new(0), undefined);
    }

    static fromJoin(meshes: Mesh[]): Mesh {
        // join meshes, dont try to look for duplicate vertices
        // TODO : make this the trouble of Matrices and Arrays
        let vertCount = 0;
        let faceCount = 0;

        for (let mesh of meshes) {
            vertCount += mesh.verts.count;
            faceCount += mesh.links.count();
        }

        let verts = MultiVector3.new(vertCount);
        let links = new IntMatrix(faceCount, 3);

        let accVerts = 0;
        let accFaces = 0;

        for (let mesh of meshes) {
            for (let i = 0; i < mesh.verts.count; i++) {
                verts.set(accVerts + i, mesh.verts.get(i));
            }
            for (let i = 0; i < mesh.links.count(); i++) {
                let face = mesh.links.getRow(i);
                for (let j = 0; j < face.length; j++) {
                    face[j] = face[j] + accVerts;
                }
                links.setRow(accFaces + i, face);
            }
            accVerts += mesh.verts.count;
            accFaces += mesh.links.count();
        }

        return new Mesh(verts, links);
    }

    static fromRectangle(rect: Rectangle3): Mesh {
        let verts = rect.getCorners();

        // we cant handle quads yet
        let faces: number[] = [];
        faces.push(...quadToTri(cubeFaces[0]));
        return this.fromLists(verts, faces);
    }

    static fromRectDoubleSided(rect: Rectangle3, texture?: ImageData) {
        let verts = rect.getCorners();
        let uvs = MultiVector2.fromData(new Float32Array([
            0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        ]),);
        let faces = IntMatrix.fromList([0, 1, 3, 0, 3, 2, 0, 3, 1, 0, 2, 3], 3);
        let mesh = Mesh.new(MultiVector3.fromList(verts), faces, uvs);
        return mesh;
    }

    static newQuad(corners: Vector3[]) {
        let faces = [...quadToTri(cubeFaces[0])];
        return this.fromLists(corners, faces);
    }

    static newOct(corners: Vector3[]): Mesh {
        let faces: number[] = [];
        for (let face of cubeFaces) {
            faces.push(...quadToTri(face));
        }
        return this.fromLists(corners, faces);
    }

    static fromCube(cube: Cube): Mesh {
        let verts = cube.getCorners();
        return Mesh.newOct(verts);
    }

    static newDefaultCube(): Mesh {
        let cube = new Cube(Plane.WorldXY(), Domain3.fromRadius(0.5));
        let verts = cube.getCorners();
        return Mesh.newOct(verts);
    }

    static newIcosahedron(scale = 1): Mesh {
        let graph = new Graph();

        let a = scale;
        let phi = (1 + 5 ** 0.5) / 2;
        let b = a * phi;

        let addVert = (v: Vector3) => {
            graph.addVert(v, v);
        };

        addVert(new Vector3(-a, -b, 0));
        addVert(new Vector3(a, -b, 0));
        addVert(new Vector3(-a, b, 0));
        addVert(new Vector3(a, b, 0));
        addVert(new Vector3(0, -a, -b));
        addVert(new Vector3(0, a, -b));
        addVert(new Vector3(0, -a, b));
        addVert(new Vector3(0, a, b));
        addVert(new Vector3(-b, 0, -a));
        addVert(new Vector3(-b, 0, a));
        addVert(new Vector3(b, 0, -a));
        addVert(new Vector3(b, 0, a));

        // build edges
        let addEdge = (a: number, b: number) => {
            graph.addEdge(a, b);
        };
        for (let i = 0; i < 12; i += 4) {
            addEdge(i + 0, i + 1);
            addEdge(i + 2, i + 3);

            let inext = (i + 4) % 12;

            addEdge(i + 0, inext + 2);
            addEdge(i + 0, inext + 0);
            addEdge(i + 1, inext + 2);
            addEdge(i + 1, inext + 0);

            addEdge(i + 2, inext + 3);
            addEdge(i + 2, inext + 1);
            addEdge(i + 3, inext + 3);
            addEdge(i + 3, inext + 1);
        }

        return this.fromGraph(graph);
    }

    // TODO remove center. Just move afterwards
    static newSphere(center: Vector3, radius: number, numRings: number, resolution: number): Mesh {
        // verts
        let vertCount = numRings * resolution + 2;
        let verts = MultiVector3.new(vertCount);
        let setVert = function (i: number, vector: Vector3) {
            verts.set(i, vector.scale(radius).add(center));
        };

        setVert(0, new Vector3(0, 0, 1));
        for (let ring = 0; ring < numRings; ring++) {
            for (let perRing = 0; perRing < resolution; perRing++) {
                let alpha = (Math.PI * (ring + 1)) / (numRings + 1);
                let beta = (2 * Math.PI * perRing) / resolution;

                let x = Math.sin(alpha) * Math.cos(beta);
                let y = Math.sin(alpha) * Math.sin(beta);
                let z = Math.cos(alpha);

                let index = 1 + ring * resolution + perRing;
                setVert(index, new Vector3(x, y, z));
            }
        }
        setVert(vertCount - 1, new Vector3(0, 0, -1));

        // faces
        let faceCount = resolution * numRings * 2;
        let links = new IntMatrix(faceCount, 3);
        links.fill(-1);
        let setFace = function (i: number, row: number[]) {
            links.setRow(i, row);
        };

        // faces top
        for (let i = 0; i < resolution; i++) {
            setFace(i, [0, i + 1, ((i + 1) % resolution) + 1]);
        }

        // faces middle
        // we are at this cursor
        // console.log("faces", faceCount);

        for (let ring = 0; ring < numRings - 1; ring++) {
            let vertCursor = resolution * ring + 1;
            let vertCursorBelow = vertCursor + resolution;

            for (let perRing = 0; perRing < resolution; perRing++) {
                let a = vertCursor + perRing;
                let b = vertCursor + ((perRing + 1) % resolution);

                let c = vertCursorBelow + perRing;
                let d = vertCursorBelow + ((perRing + 1) % resolution);

                let iFace = resolution + resolution * ring * 2 + perRing * 2;

                // console.log(iFace);
                setFace(iFace, [a, c, b]);
                setFace(iFace + 1, [c, d, b]);
            }
        }

        // faces bottom
        for (let i = 0; i < resolution; i++) {
            let iNext = (i + 1) % resolution;
            let last = vertCount - 1;

            let iFace = faceCount - resolution + i;

            let zero = vertCount - resolution - 1;
            let vertI = zero + i;
            let vertINext = zero + iNext;

            // console.log(iFace);
            // console.log("face", last, vertINext, vertI);

            setFace(iFace, [last, vertINext, vertI]);
        }

        return new Mesh(verts, links);
    }

    // TODO remove from & to, Just move the mesh afterwards
    static newCylinder(from: Vector3, to: Vector3, radius: number, resolution: number): Mesh {
        let normal = to.subbed(from);

        let numVerts = resolution * 2 + 2;
        let numFaces = (numVerts - 2) * 2;
        let verts = MultiVector3.new(numVerts);

        // some dumb stuff
        let setVert = function (i: number, vector: Vector3) {
            verts.set(i, vector);
        };

        // planes to represent top & bottom
        let planeFrom = Plane.fromPN(from, normal);
        // console.log(planeFrom);

        let planeTo = Plane.fromPN(to, normal);
        // console.log(planeFrom);

        // verts 'from ring
        setVert(0, from);
        for (let i = 0; i < resolution; i++) {
            let v = new Vector3(
                Math.cos((Math.PI * 2 * i) / resolution),
                Math.sin((Math.PI * 2 * i) / resolution),
                0,
            ).scale(radius);

            v = planeFrom.matrix.multiplyVector(v);
            setVert(i + 1, v);
        }

        // verts 'to' ring
        let numVertsHalf = numVerts / 2;
        for (let i = 0; i < resolution; i++) {
            let v = new Vector3(
                Math.cos((Math.PI * 2 * i) / resolution),
                Math.sin((Math.PI * 2 * i) / resolution),
                0,
            ).scale(radius);

            v = planeTo.matrix.multiplyVector(v);
            setVert(numVertsHalf + i, v);
        }
        setVert(numVerts - 1, to);

        // start making links
        let links = new IntMatrix(numFaces, 3);
        links.fill(-1);
        let setFace = function (i: number, row: number[]) {
            links.setRow(i, row);
        };

        // set faces
        for (let i = 0; i < resolution; i++) {
            let a = 0;
            let b = 1 + i;
            let c = 1 + ((i + 1) % resolution);

            let d = numVerts - 1;
            let e = numVertsHalf + i;
            let f = numVertsHalf + ((i + 1) % resolution);

            setFace(i * 4, [a, c, b]);
            setFace(i * 4 + 1, [b, c, e]);
            setFace(i * 4 + 2, [c, f, e]);
            setFace(i * 4 + 3, [d, e, f]);
        }

        return new Mesh(verts, links);
    }

    // TODO remove center, just move afterwards
    static newCone(center: Vector3, radius: number, height: number, resolution: number) {
        let numVerts = resolution + 2;
        let numFaces = resolution * 2;
        let verts = MultiVector3.new(numVerts);
        let setVert = function (i: number, vector: Vector3) {
            verts.set(i, vector.add(center));
        };
        let links = new IntMatrix(numFaces, 3);
        links.fill(-1);
        let setFace = function (i: number, row: number[]) {
            links.setRow(i, row);
        };

        // set verts
        setVert(0, new Vector3(0, 0, 0));
        for (let i = 0; i < resolution; i++) {
            setVert(
                i + 1,
                new Vector3(
                    Math.cos((Math.PI * 2 * i) / resolution),
                    Math.sin((Math.PI * 2 * i) / resolution),
                    0,
                ).scale(radius),
            );
        }
        setVert(numVerts - 1, new Vector3(0, 0, height));

        // set faces
        for (let i = 0; i < resolution; i++) {
            let a = 0;
            let b = numVerts - 1;
            let c = 1 + i;
            let d = 1 + ((i + 1) % resolution);

            setFace(i * 2, [a, d, c]);
            setFace(i * 2 + 1, [c, d, b]);
        }

        return new Mesh(verts, links);
    }

    static newTorus(r1: number, r2: number, ringCount: number, vertCount: number) {
        // verts * normals
        let count = ringCount * vertCount;
        let verts = MultiVector3.new(count);
        let normals = MultiVector3.new(count);

        // create `resolution` number of section rings
        for (let i = 0; i < ringCount; i++) {
            let alpha = (Math.PI * 2 * i) / ringCount;
            let ringCenter = Vector3.new(Math.cos(alpha) * r1, Math.sin(alpha) * r1, 0);

            // per section, create `sectionResolution` number of
            for (let j = 0; j < vertCount; j++) {
                let beta = (Math.PI * 2 * j) / vertCount;
                let normal = Vector3.new(
                    Math.cos(beta) * Math.cos(alpha),
                    Math.cos(beta) * Math.sin(alpha),
                    Math.sin(beta),
                ).normalize();

                normals.set(i * vertCount + j, normal);
                verts.set(i * vertCount + j, normal.scale(r2).add(ringCenter));
            }
        }

        // links & uvs
        let links = IntMatrix.new(count * 2, 3);
        let uvs = undefined;

        let getIndex = (i: number, j: number) => {
            return (i % ringCount) * vertCount + (j % vertCount);
        };

        for (let i = 0; i < ringCount; i++) {
            for (let j = 0; j < vertCount; j++) {
                let a = getIndex(i, j);
                let b = getIndex(i, j + 1);
                let c = getIndex(i + 1, j);
                let d = getIndex(i + 1, j + 1);

                let iRow = a * 2;

                links.setRow(iRow, [a, c, b]);
                links.setRow(iRow + 1, [b, c, d]);
            }
        }

        let mesh = Mesh.new(verts, links, uvs, normals);
        return mesh;
    }

    static fromGraph(graph: Graph): Mesh {
        // NOTE : doesnt really work if the loops are not of size 3.

        let verts = MultiVector3.fromList(graph.allVertPositions());
        let loops = graph.allVertLoopsAsInts();

        let links = new IntMatrix(loops.length, 3);
        loops.forEach((loop, i) => {
            if (loop.length == 3) {
                links.setRow(i, loop);
            } else {
                console.log("cant convert loop");
            }
        });
        return Mesh.new(verts, links);
    }

    // ------- CONVERTERS

    toLines(): Mesh {
        const getLines = (num: number) => {
            let count = this.links.count() * num;
            let lines = new IntMatrix(count, 2);
            for (let i = 0; i < this.links.count(); i++) {
                for (let j = 0; j < num; j++) {
                    let jnext = (j + 1) % num;
                    let iLines = i * num + j;
                    lines.set(iLines, 0, this.links.get(i, j));
                    lines.set(iLines, 1, this.links.get(i, jnext));
                }
            }
            return lines;
        };

        let type = this.getType();
        if (type == MeshType.Lines) {
            return this.clone();
        } else if (type == MeshType.Triangles) {
            let lines = getLines(3);
            return Mesh.new(this.verts.clone(), lines);
        } else if (type == MeshType.Quads) {
            let lines = getLines(4);
            return Mesh.new(this.verts.clone(), lines);
        } else {
            console.warn("cannot convert to lines");
            return Mesh.newEmpty(0, 0, 0);
        }
    }

    ToShaderMesh(): ShaderMesh {
        return ShaderMesh.fromMesh(this);
    }

    toGraph(): Graph {
        return Graph.fromMesh(this);
    }

    toLinearMesh() {
        // convert to non-indexed verts & norms
        this.ensureFaceNormals();
        let count = this.links.data.length;
        let faceCount = this.links.count();

        

        let verts = MultiVector3.new(count);
        let norms = MultiVector3.new(count);

        for (let i = 0; i < faceCount; i++) {
            let norm = this.normals!.get(i);
            this.links.getRow(i).forEach((v, j) => {
                let id = i * 3 + j;
                verts.set(id, this.verts.get(v));
                norms.set(id, norm);
            });
        }

        // let links = IntMatrix.fromList([], 3);
        // links._width = 3;
        // links._height = count / 3;
        // links.data = getLongDefaultIndices(count);
        let mesh = new Mesh(verts, undefined, undefined, norms);
        return mesh;
    }

    // ------ GETTERS

    getVerticesOfFace(f: number) {
        let verts = MultiVector3.new(this.links._width);
        this.links.getRow(f).forEach((v, i) => {
            verts.set(i, this.verts.get(v));
        });
        return verts;
    }

    get type() {
        return this.getType();
    }

    getType(): MeshType {
        if (this.links._width == MeshType.Points) {
            return MeshType.Points;
        } else if (this.links._width == MeshType.Lines) {
            return MeshType.Lines;
        } else if (this.links._width == MeshType.Triangles) {
            return MeshType.Triangles;
        } else if (this.links._width == MeshType.Quads) {
            return MeshType.Quads;
        } else {
            return MeshType.Invalid;
        }
    }

    // ----- Normals -----

    calcAndSetFaceNormals() {
        this._normalKind = NormalKind.Face;
        this._normals = this.calculateFaceNormals();
    }

    calcAndSetVertexNormals() {
        this._normalKind = NormalKind.Vertex;
        this._normals = this.calculateVertexNormals();
    }

    ensureVertexNormals() {
        if (this._normals && this._normals.count == this.verts.count) {
            this._normalKind = NormalKind.Vertex;
            return;
        } else {
            // console.warn("no or incorrect vertex normals! recalculating...");
            this.calcAndSetVertexNormals();
            return;
        }
    }

    ensureFaceNormals() {
        if (this._normals && this._normals.count == this.links.count()) {
            this._normalKind = NormalKind.Face;
            return true;
        } else {
            // console.warn("no or incorrect face normals! recalculating...");
            this.calcAndSetFaceNormals();
            return false;
        }
    }

    ensureMultiFaceNormals() {
        if (this._normals && this.normals!.count == this.maxSize) {
            this._normalKind = NormalKind.MultiVertex;
            return true;
        } else {
            // console.warn("no or incorrect face normals! recalculating...");

            return false;
        }
    }

    private calculateFaceNormals(): MultiVector3 {
        if (this.getType() != MeshType.Triangles) {
            console.error("can only calculate normals from triangular meshes");
            return MultiVector3.new(0);
        }

        let faceCount = this.links.count();
        let norms = MultiVector3.new(faceCount);

        for (let i = 0; i < faceCount; i++) {
            let verts = this.getVerticesOfFace(i);
            let normal = verts
                .get(1)
                .subbed(verts.get(0))
                .cross(verts.get(2).subbed(verts.get(0)))
                .normalize();
            norms.set(i, normal);
        }

        return norms;
    }

    private calculateVertexNormals(): MultiVector3 {
        // note: this is not completely accurate
        // set the vertex normal to the average of all adjacent face normals
        let faceCount = this.links.count();
        let faceNormals = this.OLDcalculateFaceNormals();

        // stack all face normals per vertex
        let normals = MultiVector3.new(this.verts.count);
        for (let i = 0; i < faceCount; i++) {
            let normal = faceNormals[i];
            this.links.getRow(i).forEach((vertexIndex) => {
                let v = normals.get(vertexIndex);
                normals.set(vertexIndex, v.add(normal));
            });
        }

        // normalize all
        for (let i = 0; i < normals.count; i++) {
            normals.set(i, normals.get(i).normalize());
        }
        return normals;
    }

    // -------- MISC ----------

    OLDcalculateFaceNormals(): Vector3[] {
        let norms: Vector3[] = [];
        if (this.getType() != MeshType.Triangles) {
            console.error("can only calculate normals from triangular meshes");
            return norms;
        }

        let faceCount = this.links.count();
        for (let i = 0; i < faceCount; i++) {
            let verts = this.getVerticesOfFace(i).toList();
            let normal = verts[1].subbed(verts[0]).cross(verts[2].subbed(verts[0])).normalize();
            norms.push(normal);
        }

        return norms;
    }

    OLDcalculateVertexNormals(): Vector3[] {
        let faceCount = this.links.count();
        let faceNormals = this.OLDcalculateFaceNormals();

        // stack all face normals per vertex
        let array = MultiVector3.new(this.verts.count);
        for (let i = 0; i < faceCount; i++) {
            let normal = faceNormals[i];
            this.links.getRow(i).forEach((vertexIndex) => {
                let v = array.get(vertexIndex);
                array.set(vertexIndex, v.add(normal));
            });
        }

        // normalize all
        let normals = array.toList();
        for (let i = 0; i < normals.length; i++) {
            normals[i].normalize();
        }
        return normals;
    }

    // ------ UVS

    ensureUVs() {
        if (this._uvs && this._uvs.count == this.maxSize) {
            return true;
        } else {
            // console.warn("no uvs yet! filling with dummy data");
            this._uvs = MultiVector2.new(this.maxSize);
            return false;
        }
    }
}

// ================ Help ==================

// 0 ------- 1
// | \     / |
// |  4---5  |
// |  |   |  |
// |  6---7  |
// | /     \ |
// 2 ------- 3
const cubeFaces = [
    [0, 1, 3, 2], // front
    [4, 0, 2, 6], // left
    [1, 0, 4, 5], // top
    [1, 5, 7, 3], // right
    [2, 3, 7, 6], // bottom
    [5, 4, 6, 7], // back
];

const cubeUVS = [
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
]

export function quadToTri(abcd: number[]): number[] {
    return [abcd[0], abcd[2], abcd[1], abcd[0], abcd[3], abcd[2]];
}
