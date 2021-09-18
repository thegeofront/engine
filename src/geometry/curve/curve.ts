// name:    spline.ts
// author:  Jos Feenstra
// purpose: base class for all parametric curves:
// - Bezier
// - Spline
// - Polyline (not terminologically correct but in terms of logic it makes sense)

import { MultiVector3 } from "../../data/MultiVector3";
import { GeonMath, Polyline, Util } from "../../lib";
import { Domain } from "../../math/Domain";
import { Const } from "../../math/Const";
import { Matrix4 } from "../../math/matrix";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { MultiLine } from "../../mesh/MultiLine";
import { Geometry } from "../Geometry";

// domain is always normalzed, from 0 to 1
export abstract class Curve extends Geometry {
    constructor(
        public verts: MultiVector3,
        public readonly degree: number,
        public readonly domain = Domain.new(0, 1),
    ) {
        super();
    }

    toPolyline(segments: number) {
        let count = segments + 1;
        let verts = MultiVector3.new(count);
        for (let i = 0; i < count; i++) {
            let t = i / segments; // fraction
            verts.set(i, this.pointAt(this.domain.elevate(t)));
        }
        return Polyline.new(verts);
    }

    buffer(segments = Const.BEZIER_SEGMENTS): MultiLine {
        return MultiLine.fromPolyline(this.toPolyline(segments));
    }

    abstract pointAt(t: number): Vector3;

    // abstract buffer(numSegments: number): MultiLine;

    abstract clone(): Curve;

    abstract transform(m: Matrix4): Curve;

    abstract transformed(m: Matrix4): Curve;

    // deal with 'length'

    // protected length
    // protected lengthMap!: number[];
    // protected mustRecalculate = true;

    // protected recalculateLength() {}

    // public getLength() {
    //     if (mustRecalculate) {
    //         this.recalculateLength();
    //     }

    // }
}
