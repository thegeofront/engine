// name:    polyline.ts
// author:  Jos Feenstra
// purpose: Representation of a polyline.
// Note: ive complicated this quite a bit, since we have to deal with the length of the polyline quite often.
// I want to keep side effects to a minimum, so bufferLengths() needs to be called everytime the curve is changed in some way

import { MultiVector3 } from "../../data/multi-vector";
import { GeonMath } from "../../lib";
import { Matrix4 } from "../../math/matrix";
import { Vector3 } from "../../math/vector";
import { MultiLine } from "../../mesh/multi-line";
import { Curve } from "./curve";

export class Polyline extends Curve {
    private _lengths?: number[];

    private constructor(verts: Vector3[]) {
        super(verts, 1);
        this.bufferLengths();
    }

    static new(verts: Vector3[]) {
        return new Polyline(verts);
    }

    pointAt(t: number): Vector3 {
        let count = this.verts.length - 1;

        let p = t * count;
        let idxA = Math.floor(p);
        let idxB = Math.ceil(p);

        return Vector3.fromLerp(this.verts[idxA], this.verts[idxB], p - idxA);
    }

    lengthAt(t: number): number {
        let lengths = this.getLazyLengths();
        return GeonMath.sample(lengths, t);
    }

    tAtLength(length: number): number {
        let lengths = this.getLazyLengths();
        let [idxA, idxB] = GeonMath.between(lengths, length);
        let [min, max] = [lengths[idxA], lengths[idxB]];

        let f = GeonMath.fraction(length, min, max);
        return GeonMath.lerp(lengths[idxA], lengths[idxB], f);
    }

    length(): number {
        return this.getLazyLengths()[this.verts.length - 1];
    }

    getLazyLengths() {
        if (!this._lengths) {
            this.bufferLengths();
        }
        return this._lengths!;
    }

    bufferLengths() {
        let count = this.verts.length;
        let lengths = Array<number>(count);
        let acc = 0.0;
        lengths[0] = acc;
        for (let i = 0; i < count - 1; i++) {
            acc += this.verts[i].disTo(this.verts[i + 1]);
            lengths[i + 1] = acc;
        }
        this._lengths = lengths;
    }

    buffer(): MultiLine {
        return MultiLine.fromPolyline(this);
    }

    // geo trait

    clone(): Polyline {
        let b = Polyline.new(MultiVector3.fromList(this.verts).toList());
        return b;
    }

    transform(m: Matrix4): Polyline {
        this._lengths = undefined; // invalidate buffered data
        this.verts = m.multipliedVectorList(this.verts);
        return this;
    }

    transformed(m: Matrix4): Polyline {
        this._lengths = undefined; // invalidate buffered data
        return Polyline.new(m.multipliedVectorList(this.verts));
    }
}
