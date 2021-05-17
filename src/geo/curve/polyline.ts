import { MultiVector3 } from "../../data/multi-vector";
import { Matrix4 } from "../../math/matrix";
import { Vector3 } from "../../math/vector";
import { Curve } from "./curve";

export class Polyline extends Curve {
    private constructor(verts: Vector3[]) {
        super(verts, 1);
    }

    static new(verts: Vector3[]) {
        return new Polyline(verts);
    }

    eval(t: number): Vector3 {
        let count = this.verts.length - 1;

        let p = t * count;
        let idxA = Math.floor(p);
        let idxB = Math.ceil(p);

        return Vector3.fromLerp(this.verts[idxA], this.verts[idxB], p - idxA);
    }

    buffer() {
        return super.buffer(this.verts.length - 1);
    }

    clone(): Polyline {
        let b = Polyline.new(MultiVector3.fromList(this.verts).toList());
        return b;
    }

    transform(m: Matrix4): Polyline {
        m.multiplyVectorList(this.verts);
        return this;
    }
}
