import { Domain2 } from "../math/domain";
import { Matrix3 } from "../math/matrix";
import { Vector2 } from "../math/vector";

// basic 2d rectangle
// a Matrix3 and Domain2 is used. 
// this way, a rectangle can be rotated around an arbirtary point it regards as its center.
export class Rectangle2 {

    pose: Matrix3;
    domain: Domain2;

    constructor(pose: Matrix3, domain: Domain2) {
        this.pose = pose;
        this.domain = domain;
    }

    center() : Vector2 {
        return this.pose.transformVector(new Vector2(0, 0));
    }

    getVertices() : Vector2[] {

        let verts = [
            new Vector2(this.domain.x.t0, this.domain.y.t0),
            new Vector2(this.domain.x.t1, this.domain.y.t0),
            new Vector2(this.domain.x.t0, this.domain.y.t1),
            new Vector2(this.domain.x.t1, this.domain.y.t1),
        ];

        verts.forEach((v) => this.pose.transformVector(v));
        return verts;
    }

}