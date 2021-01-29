// name:    line-render-data.ts
// author:  Jos Feenstra
// purpose: represents an object which can be fed directly to a linerenderer.
//          use it to not continuously have to calculate these aspects if the underlying object is unchanged.

import { FloatMatrix } from "../data/float-matrix";
import { getGeneralFloatMatrix, Vector2Array, Vector3Array } from "../data/vector-array"
import { Circle2 } from "../geo/circle2";
import { Circle3 } from "../geo/circle3";
import { Cube } from "../geo/cube";
import { Mesh } from "../geo/mesh";
import { Plane } from "../geo/plane";
import { Const } from "../math/const";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";

export class LineArray {
    
    verts: FloatMatrix;
    ids: Uint16Array;

    private constructor(verts: FloatMatrix, ids?: Uint16Array) {
        this.verts = verts;
        if (ids == undefined) {
            this.ids = getDefaultIndices(verts.count());
        } else {
            this.ids = ids;
        }
    }

    static fromLines(verts: Vector2[] | Vector3[] | Vector2Array | Vector3Array) {
        
        let data = getGeneralFloatMatrix(verts);
        return new LineArray(data);
    }

    // get all lines from a mesh
    static fromMesh(mesh: Mesh, uv=false) : LineArray {
        
        // 3 edges per face, 2 indices per edge
        let count = mesh.faces.count() * 6;
        let data = new Uint16Array(count);
        for (let i = 0 ; i < mesh.faces.count(); i++) {
            
            let iData = i * 6;
            data[iData]   = mesh.faces.get(i, 0);
            data[iData+1] = mesh.faces.get(i, 1);
            data[iData+2] = mesh.faces.get(i, 1);
            data[iData+3] = mesh.faces.get(i, 2);
            data[iData+4] = mesh.faces.get(i, 2);
            data[iData+5] = mesh.faces.get(i, 0);
        }
        if (uv) {
            return new LineArray(mesh.uvs, data);
        } else {
            return new LineArray(mesh.verts, data);
        }
    }
    
    // get all lines from a plane
    static fromPlane(plane: Plane) : LineArray {

        let count = Const.PLANE_RENDER_LINECOUNT;
        let dis = Const.PLANE_RENDER_LINEDISTANCE;
        let disSmall = dis / 10;
        let halfTotalSize = ((count-1) * dis) / 2;

        // 2 vectors per line, 2 lines per count
        // plus 5 lines, for ihat and jhat icons 
        let lines = new Vector3Array(count * 4 + 5 * 2);

        // x lines
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + dis * i;
            lines.setVector(i*2,     new Vector3(t, -halfTotalSize, 0));
            lines.setVector(i*2 + 1, new Vector3(t,  halfTotalSize, 0));
        }

        // y lines 
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + dis * i;
            lines.setVector(2*count + i*2,     new Vector3(-halfTotalSize, -halfTotalSize + dis * i, 0));
            lines.setVector(2*count + i*2 + 1, new Vector3( halfTotalSize, -halfTotalSize + dis * i ,0));
        }

        // icon I  to show ihat
        let iconLine1 = lines.count() - 10;
        lines.setVector(iconLine1, new Vector3(halfTotalSize+disSmall,-disSmall, 0));
        lines.setVector(iconLine1+1, new Vector3(halfTotalSize+disSmall*4, disSmall, 0));

        let iconLine2 = lines.count() - 8;
        lines.setVector(iconLine2, new Vector3(halfTotalSize+disSmall, disSmall, 0));
        lines.setVector(iconLine2+1, new Vector3(halfTotalSize+disSmall*4, -disSmall, 0));

        // icon II to show jhat
        let iconLine3 = lines.count() - 6;
        lines.setVector(iconLine3, new Vector3(0, halfTotalSize+disSmall*2.5, 0));
        lines.setVector(iconLine3+1, new Vector3(disSmall, halfTotalSize+disSmall*4, 0));

        let iconLine4 = lines.count() - 4;
        lines.setVector(iconLine4, new Vector3(disSmall, halfTotalSize+disSmall, 0));
        lines.setVector(iconLine4+1, new Vector3(-disSmall, halfTotalSize+disSmall*4, 0));

        // icon III to show khat / normal direction
        let iconLine5 = lines.count() - 2;
        lines.setVector(iconLine5, new Vector3(0, 0, 0));
        lines.setVector(iconLine5+1, new Vector3(0, 0, dis));

        // finally, transform everything to worldspace, and create the linerenderdata object
        lines.forEach((v) => plane.pushToWorld(v));
        return new LineArray(lines);
    }

    // get all lines representing a circle in 2d. use an optional matrix to 
    static fromCircle(c: Circle3) : LineArray {
        
        let count = Const.CIRCLE_SEGMENTS;
        // let count = 12;
        let verts = new Vector3Array(count);

        // x lines
        for(let i = 0 ; i < count; i++) {

            // radial fraction of a circle
            let t = (i / count) * (Math.PI*2);
            verts.setVector(i, 
                c.plane.pushToWorld(new Vector3(Math.cos(t) *c.radius, Math.sin(t) * c.radius, 0))
            );
        }
        return new LineArray(verts, getPairIndices(count));
    }

    // turn a spline into a polyline, and render it
    static fromSpline() {
        throw "todo!";
    }

    static fromCube(cube: Cube) : LineArray {

        let verts = Vector3Array.fromList(cube.getCorners());

        return new LineArray(verts, );
    }
}

// just get an int sequence from 0 to length. 
function getDefaultIndices(count: number) : Uint16Array {
    
    let data = new Uint16Array(count);
    for(let i = 0 ; i < count; i++) {
        data[i] = i;
    }
    return data; 
}

function getPairIndices(count: number) : Uint16Array {

    // given count of 3 => return 0,1 | 1,2 | 2,0
    let length = count * 2;
    let data = new Uint16Array(length);
    for(let i = 0 ; i < count; i++) {
        data[i*2] = i;
        data[i*2 + 1] = (i + 1) % count;
    }
    return data; 
}