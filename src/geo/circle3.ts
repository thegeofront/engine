
// purpose: represents a 3d circle

import { Const } from "../math/const";
import { Vector3 } from "../math/vector";
import { Plane } from "./plane";



export class Circle3 {

    plane: Plane;
    radius: number;

    constructor(plane: Plane, radius: number) {
        this.plane = plane;
        this.radius = radius;
    }

    includes(p: Vector3) : boolean {
        // test if the point falls in range of the circle, by regarding
        // the circle as a torus

        // CHANGE NOTE: i set this to zero, for testing
        // vertical error
        let [projPoint, yError] = this.plane.closestPoint(p);
        yError = yError / 3
    
        // horizontal error: get the difference between point
        let xError = this.plane.center.clone().disTo(projPoint) - this.radius;
    
        // length of total error vector needs to be smaller than the given
        // tolerance
        return yError**2 + xError **2 < Const.TOL_SQUARED;
    }

    

}