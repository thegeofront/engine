import { Vector3 } from "../../math/vector";
import { Bezier } from "./bezier";
import { MAX_DEGREE, PASCAL } from "./curve";

type NewType = Vector3;

export class Spline {
    static new(verts: NewType[], degree: number) {
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

        return new Spline();
    }
}
