// name:    spline.ts
// author:  Jos Feenstra
// purpose: mathematical representation of parametric curves
// notes:   - using Vector3[] > MultiVector3, since their is no added benefit as of right now

import { MultiVector3 } from "../../data/multi-vector-3";
import { GeonMath } from "../../math/math";
import { Matrix4 } from "../../math/matrix";
import { Polynomial } from "../../math/polynomial";
import { Random } from "../../math/random";
import { Util } from "../../math/util";
import { Vector3 } from "../../math/vector";
import { MultiLine } from "../../mesh/multi-line";
import { Stopwatch } from "../../system/stopwatch";
import { Curve } from "./curve";
import { Polyline } from "./polyline";

export class Bezier extends Curve {
    private _approx?: Polyline;

    public constructor(verts: MultiVector3, degree: number) {
        super(verts, degree);
    }

    static fromList(verts: Vector3[]) {
        return this.new(MultiVector3.fromList(verts));
    }

    static new(verts: MultiVector3) {
        return new Bezier(verts, verts.count - 1);
    }

    /**
     * Calculate the so-called hodograph of this curve, which is a curve representing all its tangents
     */
    hodograph(): Bezier {
        let hodoVerts = MultiVector3.new(this.verts.count - 1);
        for (let i = 0; i < this.verts.count - 1; i++) {
            hodoVerts.set(i, this.verts.get(i + 1).subbed(this.verts.get(i)));
        }
        return Bezier.new(hodoVerts);
    }

    /**
     * Return a new curve which is a copy of this curve, but with one added control point
     * Do this recursively, and you have something like decastejau's
     * However, this process cannot be rewritten as a polynomial, since the i / (n + 1) ratio changes constantly
     */
    increaseDegree(): Bezier {
        // if (degree <= this.degree) {
        //     console.warn("same or lower degree than my current degree...");
        //     return this.clone();
        // }

        // increase degree by one.
        let n = this.degree;
        let verts = MultiVector3.new(n + 2);

        // copy first and last
        verts.set(0, this.verts.get(0));
        verts.set(verts.count - 1, this.verts.get(this.verts.count - 1));

        // interpolate in-betweens
        for (let i = 1; i < n + 1; i++) {
            let pa = this.verts.get(i - 1);
            let pb = this.verts.get(i);
            let sa = i / (n + 1);
            let sb = 1 - sa;
            let q = pa.scale(sa).add(pb.scale(sb));
            verts.set(i, q);
        }

        // create a new curve from it
        return Bezier.new(verts);
    }

    /**
     *  This function returns the entire castejau piramid.
     *  the final point is the first: verts[0].
     *  Hovever, this is slower than the PointAt() method,
     *  which uses bernstein polynomials
     *
     *  useful for:
     *  Subdividing bezier curves, debugging, and splines
     */
    decastejau(t: number): MultiVector3 {
        let size = this.verts.count;
        // console.log(points.count);

        // create the triangle of resulting points
        let result = MultiVector3.new(GeonMath.stack(size));

        // triangle iteration is complex :)
        let tri = Util.iterateTriangle;

        // copy paste the base
        let basecolumn = size - 1;
        let i = 0;
        for (let row = 0; row <= basecolumn; row++) {
            let idx = tri(basecolumn, row);
            result.set(idx, this.verts.get(i));
            i++;
        }

        // iterate over this triangle, starting at the base + 1
        for (let col = size - 2; col > -1; col -= 1) {
            for (let row = 0; row <= col; row++) {
                let idx = tri(col, row);
                let p_a = result.get(tri(col + 1, row));
                let p_b = result.get(tri(col + 1, row + 1));
                let q = p_b.scale(t).add(p_a.scale(1 - t));
                result.set(idx, q);
            }
        }

        return result;
    }

    /**
     * subdivide into to new bezier curves,
     * with the same number of control points
     */
    splitAt(t: number): [Bezier, Bezier] {
        // get triangle
        let size = this.degree + 1;
        let tri = this.decastejau(t);

        // prepare
        let left = MultiVector3.new(this.verts.count);
        let right = MultiVector3.new(this.verts.count);

        // the two edges of the triangle opposite to the base are the vertices we are interested in
        let i = 0;
        for (let col = size - 1; col > -1; col -= 1) {
            left.set(i, tri.get(Util.iterateTriangle(col, 0)));
            right.set(i, tri.get(Util.iterateTriangle(col, col)));
            i++;
        }

        return [Bezier.new(left), Bezier.new(right)];
    }

    toPolyline(segments: number) {
        let count = segments + 1;
        let verts = MultiVector3.new(count);
        for (let i = 0; i < count; i++) {
            let t = i / segments; // fraction
            verts.set(i, this.pointAt(t));
        }
        return Polyline.new(verts);
    }

    /**
     *
     */
    pointAt(t: number): Vector3 {
        let p = Vector3.zero();
        for (let i = 0; i < this.degree + 1; i++) {
            p.add(this.verts.get(i).scaled(Polynomial.bernstein(t, i, this.degree)));
        }
        return p;
    }

    /**
     * Calculate the tangent at parameter t.
     * Tangent is calculated using a method described here: https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
     * Note that is is not the fasted thing ever. Use the hodograph to eval a huge range of tangents if you desire that
     */
    tangentAt(t: number): Vector3 {
        // evaluate the so-called 'hodograph' of this curve
        return this.hodograph().pointAt(t).normalize();
    }

    /**
     * Calculate the normal at parameter t
     */
    normalAt(t: number, up = Vector3.unitZ()): Vector3 {
        return this.tangentAt(t).cross(up);
    }

    /**
     * Note: All methods dealing with length are approximate
     */
    pointAtApproxLength(length: number) {
        this.toPolyline(100).tAtLength(length);
    }

    getLazyApprox() {
        if (!this._approx) {
            this.bufferApprox();
        }
        return this._approx!;
    }

    bufferApprox() {
        this._approx = this.toPolyline(100);
    }

    buffer(segments: number): MultiLine {
        return MultiLine.fromPolyline(this.toPolyline(segments));
    }

    // geo trait

    clone(): Bezier {
        return Bezier.new(this.verts.clone());
    }

    transform(m: Matrix4): Bezier {
        this._approx = undefined; // invalidate buffered data
        this.verts.transform(m);
        return this;
    }

    transformed(m: Matrix4): Bezier {
        this._approx = undefined; // invalidate buffered data
        return Bezier.new(this.verts.transformed(m));
    }
}

// Shorthand for Cubic Bezier
export class Cubez extends Bezier {
    private constructor(verts: MultiVector3) {
        super(verts, 3);
    }

    static new(verts: MultiVector3) {
        return new Cubez(verts);
    }
}
