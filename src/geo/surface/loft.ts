// name:    spline.ts
// author:  Jos Feenstra
// purpose: mathematical representation of a parametric surface

import { Vector3 } from "../../math/vector";
import { Bezier } from "../curve/bezier";
import { Curve } from "../curve/curve";

// todo : research tensor: https://en.wikipedia.org/wiki/Tensor_product

export abstract class Surface {
    abstract eval(u: number, v: number): Vector3;
}

export class Loft extends Surface {
    private constructor(public curves: Curve[]) {
        super();
    }

    static new(curves: Curve[]) {
        return new Loft(curves);
    }

    eval(u: number, v: number): Vector3 {
        let p = Vector3.zero();
        let pts = [];
        for (let i = 0; i < this.curves.length; i++) {
            pts.push(this.curves[i].eval(u));
        }
        return Bezier.new(pts).eval(v);
    }
}
