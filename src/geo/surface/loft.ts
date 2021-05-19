// name:    spline.ts
// author:  Jos Feenstra
// purpose: mathematical representation of a parametric loft surface

import { MultiVector3 } from "../../data/multi-vector-3";
import { Matrix4 } from "../../math/matrix";
import { Vector3 } from "../../math/vector";
import { Mesh } from "../../mesh/mesh";
import { Bezier } from "../curve/bezier";
import { Curve } from "../curve/curve";
import { Polyline } from "../curve/polyline";
import { Geo } from "../geo";
import { BiSurface } from "./surface";

export class Loft extends BiSurface {
    private constructor(public curves: Curve[]) {
        super();
    }

    static new(curves: Curve[]) {
        return new Loft(curves);
    }

    eval(u: number, v: number): Vector3 {
        return this.isoCurveV(u).pointAt(v);
    }

    isoCurveV(u: number): Bezier {
        let pts = MultiVector3.new(this.curves.length);
        for (let i = 0; i < this.curves.length; i++) {
            pts.set(i, this.curves[i].pointAt(u));
        }
        return Bezier.new(pts);
    }

    /**
     *
     * @param uSegments when using polylines, please use a value divisible by the number of polygons used:
     *      loft between 4 segment polyline & 5 segment polyline? use 20:
     *          - 4 / 20 is a round number
     *          - 5 / 20 is a round number
     * @param vSegments
     * @returns
     */
    buffer(uSegments: number, vSegments: number) {
        return Mesh.fromSurface(this, uSegments, vSegments);
    }

    /**
     * same as buffer, but the udetail is semi-automated
     */
    bufferExact() {
        // NOTE : to make this always watertight: take note of the precision when using polylines:
        let vals: number[] = [];
        for (let c of this.curves) {
            if (c instanceof Polyline) {
                vals.push(c.verts.count - 1);
            }
        }

        let perfectuSegments = vals.reduce((a, b) => {
            return a * b;
        });

        return Mesh.fromSurface(this, perfectuSegments, perfectuSegments);
    }

    clone(): Loft {
        let curves = new Array<Curve>();
        for (let i = 0; i < this.curves.length; i++) {
            curves[i] = this.curves[i].clone();
        }
        return Loft.new(curves);
    }

    transform(m: Matrix4): Loft {
        for (let c of this.curves) {
            c.transform(m);
        }
        return this;
    }

    transformed(m: Matrix4): Loft {
        let curves = new Array<Curve>();
        for (let i = 0; i < this.curves.length; i++) {
            curves[i] = this.curves[i].transformed(m);
        }
        return Loft.new(curves);
    }
}
