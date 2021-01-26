
// purpose: contains all data needed to render lines

import { Vector2Array, Vector3Array } from "../data/vector-array"
import { Circle2 } from "../geo/circle2";
import { Mesh } from "../geo/mesh";
import { Plane } from "../geo/plane";
import { Const } from "../math/const";

export class LineRenderData {
    
    verts: Vector3Array;
    ids: Uint16Array;

    private constructor(verts: Vector3Array, ids: Uint16Array) {
        this.verts = verts;
        this.ids = ids;
    }

    static fromMesh(m: Mesh) : LineRenderData {
        throw "todo";
    }

    static fromPlane(p: Plane) : LineRenderData {
        throw "todo";
    }

    static fromCircle(c: Circle2) : LineRenderData {
        let segmentCount = Const.CIRCLE_SEGMENTS;
        throw "todo";
    }
}