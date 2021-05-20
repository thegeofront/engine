// purpose: polynomial math needed for curves & surfaces
// note: uses a hardcoded pascal's triangle for performance reasons

import { MultiVector3 } from "../data/multi-vector-3";
import { GeonMath } from "./math";
import { Util } from "./util";
import { Vector3 } from "./vector";

export class Polynomial {
    // pascals's triangle. Hardcoded for performance

    static MAX_DEGREE = 15;
    static _pascal = Polynomial.calcPascal(Polynomial.MAX_DEGREE);

    /**
     *   calculate weight using the Bernstein Polynomials:
     *   (n over i) t^i * (1-t)^(n - i).
     *   precalculated Pascal's triangle for a bit more efficiency
     * @param t parameter t
     * @param i vert index
     * @param n degree
     * @returns
     */
    static bernstein(t: number, i: number, n: number): number {
        return this.getBicoef(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    /**
     * Binomial coeficient
     */
    static getBicoef(n: number, i: number) {
        return this._pascal[n][i];
    }

    /**
     * Binomial coeficient
     */
    static calcBicoef(n: number, i: number) {
        let f = GeonMath.factorial;
        return f(n) / (f(i) * f(n - i));
    }

    static calcPascal(limit: number) {
        let pascal: number[][] = Array<Array<number>>(limit);

        for (let n = 0; n < limit; n++) {
            pascal[n] = Array<number>(n + 1);
            for (let i = 0; i < n + 1; i++) {
                pascal[n][i] = this.calcBicoef(n, i);
            }
        }
        return pascal;
    }

    /**
     *  This function returns the entire castejau piramid. useful for:
     *  Subdividing bezier curves, debugging, and splines 
     *  Input: array P[0:n] of n+1 points and real number u in [0,1]
     *  Output: point on curve, C(u)
     *  Working: point array Q[0:n]

        for i := 0 to n do
            Q[i] := P[i]; // save input

        for k := 1 to n do
            for i := 0 to n - k do
                Q[i] := (1 - u)Q[i] + u Q[i + 1]; 

        return Q[0]; 
     */
    static decastejau(points: MultiVector3, t: number): MultiVector3 {
        let size = points.count;
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
            console.log(idx);
            result.set(idx, points.get(i));
            i++;
        }

        // iterate over this triangle, starting at the base + 1
        for (let col = size - 2; col > -1; col -= 1) {
            for (let row = 0; row <= col; row++) {
                let idx = tri(col, row);
                console.log(idx);
                result.get(tri(col, row));
            }
        }

        return result;
    }
}

test();

function test() {
    let result = Polynomial.decastejau(
        MultiVector3.fromNative([
            [0.0, 1.0, 2.0],
            [0.0, 1.0, 3.0],
            [0.0, 1.0, 4.0],
            [0.0, 4.0, 2.0],
            [0.0, 4.0, 2.0],
        ]),
        0.5,
    );
    console.log(result);
}
