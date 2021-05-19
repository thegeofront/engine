// todo : research tensor: https://en.wikipedia.org/wiki/Tensor_product

import { Matrix4 } from "../../math/matrix";
import { Vector3 } from "../../math/vector";
import { Bezier } from "../curve/bezier";
import { Geo } from "../geo";
import { BiSurface, TriSurface } from "./surface";

/**
 * Three sided Bezier Surface
 */
export class BezierTriangle extends TriSurface {
    clone(): Geo {
        throw new Error("Method not implemented.");
    }
    transform(m: Matrix4): Geo {
        throw new Error("Method not implemented.");
    }
    transformed(m: Matrix4): Geo {
        throw new Error("Method not implemented.");
    }
    private constructor(public verts: Vector3[], public readonly degree: number) {
        super();
    }

    static new(verts: Vector3[]) {}

    static fromThreeEdge(a: Bezier, b: Bezier, c: Bezier): BezierTriangle | undefined {
        // TODO: do magic to discover this inner control points...
        // TODO bezier curves must be of the same degree
        return undefined;
    }

    eval(u: number, v: number, w: number): Vector3 {
        throw new Error("Method not implemented.");
    }
}

/**
 * Four sided Bezier Surface
 */
export class BezierSquare extends BiSurface {
    private constructor(public verts: Vector3[], public readonly degree: number) {
        super();
    }

    static new(verts: Vector3[]) {
        let degree = Math.sqrt(verts.length);
        if (verts.length % degree != 0) {
            console.warn(
                `BiSurface Not Created. ${verts.length} vertices 
                does not match ${degree} degree surface...`,
            );
            return undefined;
        }

        return new BezierSquare(verts, degree);
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
    static fromFourEdge(a: Bezier, b: Bezier, c: Bezier, d: Bezier): BezierTriangle | undefined {
        // TODO do magic to discover the inner control points...
        // TODO bezier curves must be of the same degree
        return undefined;
    }

    eval(u: number, v: number): Vector3 {
        throw new Error("Method not implemented.");
    }

    clone(): Geo {
        throw new Error("Method not implemented.");
    }
    transform(m: Matrix4): Geo {
        throw new Error("Method not implemented.");
    }
    transformed(m: Matrix4): Geo {
        throw new Error("Method not implemented.");
    }
}
