// name:    spline.ts
// author:  Jos Feenstra
// purpose: base interface / abstract classes for surfaces

import { Geo, Mesh, Vector3 } from "../../lib";
/**
 * Any Surface. Maybe this will be expanded upon sometime in the future?
 */
export abstract class Surface extends Geo {}

/**
 * Bidirectional surface
 */
export abstract class BiSurface extends Surface {
    abstract pointAt(u: number, v: number): Vector3;
    /**
     *
     * @param uSegments when using polylines, please use a value divisible by the number of polygons used:
     *      loft between 4 segment polyline & 5 segment polyline? use 20:
     *          - 4 / 20 is a round number
     *          - 5 / 20 is a round number
     * @param vSegments
     * @returns
     */
    buffer(uSegments: number, vSegments: number): Mesh {
        return Mesh.fromSurface(this, uSegments, vSegments);
    }
}

/**
 * Tridirectional surface
 */
export abstract class TriSurface extends Surface {
    abstract eval(u: number, v: number, w: number): Vector3;
}
