// name:    spline.ts
// author:  Jos Feenstra
// purpose: B-Spline

import { Polynomial } from "../../math/polynomial";
import { Vector3 } from "../../math/vector";

type NewType = Vector3;

export class Spline {
    static new(verts: NewType[], degree: number) {
        // saveguards
        if (degree > Polynomial.MAX_DEGREE) {
            console.error(
                `cannot represent a ${degree} degree bezier curve. ${Polynomial.MAX_DEGREE} is the current max, 
                but this can easely be expanded! In general tho, try to avoid high-degree curves...`,
            );
            return undefined;
        }

        // if (verts.length > Polynomial._pascal[degree].length) {
        //     console.error(
        //         `cannot represent a ${degree} degree bezier curve with ${verts.length} control points`,
        //     );
        //     return undefined;

        return new Spline();
    }
}
