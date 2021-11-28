import { Material } from "../../lib";
import { Mesh } from "./Mesh";

export namespace ObjProcessing {

    /**
     * a processed mtl file, ready to be used in Geon
     */
    export type ProcessedMTL = Map<string, Material>

    /**
     * a processed obj file, ready to be used in Geon
     */
    export interface ProcessedObj {

    }

    /**
     * Useful for when you just want one mesh from an OBJ.
     * Not useful if you want explicit material info
     * This makes many assumptions, and many of those assumptions are incorrect in many cases...
     */
    export function dirty(text: string): Mesh {
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
   
        let mesh = Mesh.fromRawLists(verts, faces, uvs, norms);    
        return mesh;
    }
    
    export function processObj(text: string): Mesh {
        // This is not a full .obj parser.
        // see http://paulbourke.net/dataformats/obj/
        // INDEXES ORIGINALLY REFER TO LINES, so -1 is needed
        
        let data: {mesh: Mesh, mtlref: string}[] = [];
        let addMesh = (mesh: Mesh, mtlref: string) => {
            data.push({mesh, mtlref});
        } 
        

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
                case "mtllib":
                    console.log("mtllib: ", parts[0])
                    break;
                case "v":
                    for (const part of parts) {
                        verts.push(parseFloat(part));
                    }
                    break;
                case "v":
                    for (const part of parts) {
                        verts.push(parseFloat(part));
                    }
                    break;
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
    
        let mesh = Mesh.fromRawLists(verts, norms, uvs, faces);
    
        return mesh;
    }

    function materialFromMtl(mtl: string): Material[] {
        return [Material.default()];
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
    
}