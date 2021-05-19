// purpose: polynomial math needed for curves & surfaces
// note: uses a hardcoded pascal's triangle for performance reasons

import { GeonMath } from "./math";

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
}
