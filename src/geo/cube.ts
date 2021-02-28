// name:    cube.ts
// author:  Jos Feenstra
// purpose: Represents a cube in 3d space, in a certain pose. 

import { Vector3Array } from "../data/vector-array";
import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/vector";
import { Geo } from "./geo";
import { Plane } from "./plane";

export class Cube {
    
    plane: Plane
    domain: Domain3

    constructor(plane: Plane, domain: Domain3) {
        this.plane = plane;
        this.domain = domain;
    }

    
    getCorners() : Vector3[] {
        return this.domain.corners(this.plane.matrix);
    }
}