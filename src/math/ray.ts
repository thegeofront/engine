// author:  Jos Feenstra
// purpose: infinite Ray used for projection and similar actions
// notes:   found some nice examples at https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld004.htm


import { Plane } from "../geo/plane";
import { Vector3 } from "./vector";


export class Ray {
    origin: Vector3;
    normal: Vector3;

    constructor(origin: Vector3, normal: Vector3) {
        this.origin = origin;
        this.normal = normal.normalize();
    }

    at(t: number) : Vector3 {
        return this.origin.clone().add(this.normal.clone().scale(t));
    }

    xPlane(plane: Plane) : number {
        
        // ray : pt = rOrigin + t * rNormal
        // plane : a, b, c, d -> pNormal(a, b, c) , d
        // plane : P . N + d = 0;
        // substitute for p: 
        // t = -(rOrigin . N + d) / (V . N)
        
        let ray = this; // to be clear
        return -(ray.origin.dot(plane.normal) + plane.d) / (ray.normal.dot(plane.normal));
    }
}