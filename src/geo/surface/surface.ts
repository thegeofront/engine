// name:    spline.ts
// author:  Jos Feenstra
// purpose: base interface / abstract classes for surfaces

import { Geo, Vector3 } from "../../lib";
/**
 * Any Surface. Maybe this will be expanded upon sometime in the future?
 */
export abstract class Surface extends Geo {}

/**
 * Bidirectional surface
 */
export abstract class BiSurface extends Surface {
    abstract eval(u: number, v: number): Vector3;
}

/**
 * Tridirectional surface
 */
export abstract class TriSurface extends Surface {
    abstract eval(u: number, v: number, w: number): Vector3;
}
