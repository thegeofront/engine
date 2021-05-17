// name:    spline.ts
// author:  Jos Feenstra
// purpose: mathematical representation of parametric curves
// notes:   - using Vector3[] > MultiVector3, since their is no added benefit as of right now

import { MultiVector3 } from "../../data/multi-vector";
import { Matrix4 } from "../../math/matrix";
import { Vector3 } from "../../math/vector";
import { Curve, MAX_DEGREE, PASCAL } from "./curve";

export class Bezier extends Curve {
    private constructor(verts: Vector3[], degree: number) {
        super(verts, degree);
    }

    static new(verts: Vector3[]) {
        return new Bezier(verts, verts.length - 1);
    }

    /**
     *   calculate weight using the Bernstein Polynomials:
     *   (n over i) t^i * (1-t)^(n - i).
     *   precalculated Pascal's triangle for a bit more efficiency
     * @param t parameter t
     * @param i vert index
     * @param n degree
     * @returns
     */
    private static B(t: number, i: number, n: number): number {
        return PASCAL[n][i] * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    eval(t: number): Vector3 {
        let p = Vector3.zero();
        for (let i = 0; i < this.degree + 1; i++) {
            p.add(this.verts[i].scaled(Bezier.B(t, i, this.degree)));
        }
        return p;
    }

    clone(): Bezier {
        let b = Bezier.new(MultiVector3.fromList(this.verts).toList());
        return b;
    }

    transform(m: Matrix4): Bezier {
        m.multiplyVectorList(this.verts);
        return this;
    }
}
