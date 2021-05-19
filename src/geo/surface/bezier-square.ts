// todo : research tensor: https://en.wikipedia.org/wiki/Tensor_product

import { MultiVector3 } from "../../data/multi-vector-3";
import { Matrix4 } from "../../math/matrix";
import { Polynomial } from "../../math/polynomial";
import { Vector3 } from "../../math/vector";
import { Bezier } from "../curve/bezier";
import { Geo } from "../geo";
import { BiSurface, TriSurface } from "./surface";

/**
 * Four sided Bezier Surface
 */
export class BezierSquare extends BiSurface {
    private _approx: undefined;
    private constructor(public verts: MultiVector3, public readonly degree: number) {
        super();
    }

    static new(verts: MultiVector3) {
        let degree = Math.sqrt(verts.count);
        if (verts.count % degree != 0) {
            console.warn(
                `BiSurface Not Created. ${verts.count} vertices 
                does not match ${degree} degree surface...`,
            );
            return undefined;
        }

        return new BezierSquare(verts, degree - 1);
    }

    /**
     * ```
     * 0----1-----2----3
     * |    |  A  |    |
     * 4----5?----6?---7
     * | B  |     |    | D
     * 8----9?---10?---11
     * |    |     |    |
     * 12---13----14---15
     *         C
     *```
     * @param a
     * @param b
     * @param c
     * @param d
     * @returns
     */
    static fromFourEdge(a: Bezier, b: Bezier, c: Bezier, d: Bezier): BezierSquare | undefined {
        // TODO do magic to discover the inner control points...
        // TODO bezier curves must be of the same degree
        return undefined;
    }

    //

    pointAt(u: number, v: number): Vector3 {
        let p = Vector3.zero();

        let count = this.degree + 1;
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                let scalar =
                    Polynomial.bernstein(u, i, this.degree) *
                    Polynomial.bernstein(v, j, this.degree);
                let index = i * count + j;
                // console.log(i * count + j, s1, s2, scalar);
                p.add(this.verts.get(index).scaled(scalar));
            }
        }

        return p;
    }

    // geo

    clone(): BezierSquare {
        return BezierSquare.new(this.verts.clone())!;
    }

    transform(m: Matrix4): BezierSquare {
        this._approx = undefined; // invalidate buffered data
        this.verts.transform(m);
        return this;
    }

    transformed(m: Matrix4): BezierSquare {
        this._approx = undefined; // invalidate buffered data
        return BezierSquare.new(this.verts.transformed(m))!;
    }
}
