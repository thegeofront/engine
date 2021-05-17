// name:    spline.ts
// author:  Jos Feenstra
// purpose: mathematical representation of parametric curves
// notes:   - using Vector3[] > MultiVector3, since their is no added benefit as of right now

import { MultiVector3 } from "../data/multi-vector";
import { Vector3 } from "../math/vector";
import { MultiLine } from "../mesh/multi-line";

// pascals's triangle. Hardcoded for performance
const PASCAL = [
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1],
    [1, 4, 6, 4, 1],
    [1, 5, 10, 10, 5, 1],
    [1, 6, 15, 20, 15, 6, 1],
    [1, 7, 21, 35, 35, 21, 7, 1],
];
const MAX_DEGREE = PASCAL.length - 1;

// represent
// domain is always normalzed, from 0 to 1
export abstract class Curve {
    constructor(public verts: Vector3[], public readonly degree: number) {}
    abstract eval(t: number): Vector3;

    buffer(numSegments: number): MultiLine {
        return MultiLine.fromCurve(this, numSegments);
    }
}

export class Bezier extends Curve {
    private constructor(verts: Vector3[], degree: number) {
        super(verts, degree);
    }

    static new(verts: Vector3[], degree: number) {
        // saveguards
        if (degree > MAX_DEGREE) {
            console.error(
                `cannot represent a ${degree} degree bezier curve. ${MAX_DEGREE} is the current max, 
                but this can easely be expanded! In general tho, try to avoid high-degree curves...`,
            );
            return undefined;
        }

        if (verts.length > PASCAL[degree].length) {
            console.error(
                `cannot represent a ${degree} degree bezier curve with ${verts.length} control points`,
            );
            return undefined;
        }

        return new Bezier(verts, degree);
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
}
