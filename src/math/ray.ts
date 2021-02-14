// author:  Jos Feenstra
// purpose: infinite Ray used for projection and similar actions

import { Vector3 } from "./vector";


export class Ray {
    origin: Vector3;
    normal: Vector3;

    constructor(origin: Vector3, normal: Vector3) {
        this.origin = origin;
        this.normal = normal.normalize();
    }

    

}