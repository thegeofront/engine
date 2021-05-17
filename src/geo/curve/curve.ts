// name:    spline.ts
// author:  Jos Feenstra
// purpose: base class for all parametric curves:
// - Bezier
// - Spline
// - Polyline (not terminologically correct but in terms of logic it makes sense)

import { MultiLine, Vector3 } from "../../lib";

// pascals's triangle. Hardcoded for performance
export const PASCAL = [
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1],
    [1, 4, 6, 4, 1],
    [1, 5, 10, 10, 5, 1],
    [1, 6, 15, 20, 15, 6, 1],
    [1, 7, 21, 35, 35, 21, 7, 1],
];
export const MAX_DEGREE = PASCAL.length - 1;

// domain is always normalzed, from 0 to 1
export abstract class Curve {
    constructor(public verts: Vector3[], public readonly degree: number) {}
    abstract eval(t: number): Vector3;

    buffer(numSegments: number): MultiLine {
        return MultiLine.fromCurve(this, numSegments);
    }
}
