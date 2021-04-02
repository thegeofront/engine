import { Vector3 } from "../math/vector";

export class Polyline {
    verts: Vector3[] = [];

    constructor(verts: Vector3[]) {
        this.verts = verts;
    }
}
