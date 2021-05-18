// todo : research tensor: https://en.wikipedia.org/wiki/Tensor_product

import { Vector3 } from "../../math/vector";
import { Bezier } from "../curve/bezier";

/**
 * Three Edge Surface using Bezier Curves
 */
export class BezierTriangle {
    private constructor(public verts: Vector3[], public readonly degree: number) {}

    static fromThreeEdge(a: Bezier, b: Bezier, c: Bezier): BezierTriangle | undefined {
        // TODO: do magic to discover this inner control points...

        return undefined;
    }
}

/**
 * Four Edge Surface using Bezier Curves
 */
export class BezierPatch {
    private constructor(public verts: Vector3[], public readonly degree: number) {}

    static new(verts: Vector3[]) {
        let degree = Math.sqrt(verts.length);
        if (verts.length % degree != 0) {
            return undefined;
        }

        return new BezierPatch(verts, degree);
    }

    /**
     * ```
     * 0----0-----0----0
     * |    |  A  |    |
     * 0----?-----?----0
     * | B  |     |    | D
     * 0----?-----?----0
     * |    |     |    |
     * 0----0-----0----0
     *         C
     *```
     * @param a
     * @param b
     * @param c
     * @param d
     * @returns
     */
    static fromFourEdge(a: Bezier, b: Bezier, c: Bezier, d: Bezier): BezierTriangle | undefined {
        // TODO do magic to discover the inner control points

        return undefined;
    }
}
