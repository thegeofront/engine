// name:    spline.ts
// author:  Jos Feenstra
// purpose: B-Spline
// NOTE:    [JF]: my spline implementation is not perfect.
//                Due to behaviour of the coxdeboor algorithm which I dont fully understand,
//                I am forced to create knots with very slight tolerances.
//                This could create trouble down the road...

import { MultiVector3 } from "../../data/multi-vector-3";
import { Const } from "../../math/const";
import { Domain } from "../../math/domain";
import { Matrix4 } from "../../math/matrix";
import { Polynomial } from "../../math/polynomial";
import { Vector3 } from "../../math/vector";
import { MultiLine } from "../../mesh/multi-line";
import { Curve } from "./curve";

/**
 * B-Spline
 */
export class Spline extends Curve {
    private constructor(
        verts: MultiVector3,
        degree: number,
        public knots: Float32Array,
        public domain: Domain,
    ) {
        super(verts, degree);
    }

    static fromList(verts: Vector3[], degree: number) {
        return this.new(MultiVector3.fromList(verts), degree);
    }

    static calcKnots(n: number, degree: number) {
        let m = n + degree + 1; // m = n + p + 1
        let knots = new Float32Array(m);
        for (let i = 0; i < degree + 1; i++) {
            knots[i] = 0 - (degree - i) * 0.0001;
        }

        let count = knots.length - degree - degree - 1;
        let j = 1;
        for (let i = degree + 1; i < knots.length - degree - 1; i++) {
            knots[i] = j / count;
            j++;
        }

        j = 0;
        for (let i = knots.length - degree - 1; i < knots.length; i++) {
            knots[i] = 1 + j * 0.0001;
            j++;
        }
        return knots;
    }

    static new(verts: MultiVector3, degree: number) {
        let domain = Domain.new(0, 1);
        let n = verts.count;
        if (n < degree + 1) {
            return undefined;
        }
        let knots = this.calcKnots(n, degree);
        return new Spline(verts, degree, knots, domain);
    }

    pointAt(t: number): Vector3 {
        // console.clear();
        // console.log("pointat");
        // console.log("knots:", this.knots);
        // console.log("degree: ", this.degree);
        let p = Vector3.zero();
        for (let i = 0; i < this.verts.count; i++) {
            let factor = Polynomial.coxdeboor(t, i, this.degree, this.knots);
            // console.log("factor: ", factor);
            p.add(this.verts.get(i).scaled(factor));
        }
        return p;
    }

    clone(): Curve {
        throw new Error("Method not implemented.");
    }

    transform(m: Matrix4): Curve {
        throw new Error("Method not implemented.");
    }

    transformed(m: Matrix4): Curve {
        throw new Error("Method not implemented.");
    }
}
