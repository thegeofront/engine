import { Domain2 } from "../math/domain";
import { Matrix3 } from "../math/matrix";
import { Vector2 } from "../math/vector";

// basic 2d rectangle
// a Matrix3 and Domain2 is used. 
// this way, a rectangle can be rotated around an arbirtary point it regards as its center.
// name:    cube.ts
// author:  Jos Feenstra
// purpose: Represents a cube in 3d space, in a certain pose. 

import { Vector3 } from "../math/vector";
import { Geo } from "./geo";
import { Plane } from "./plane";

export class Rectangle3 {
    
    plane: Plane
    domain: Domain2

    constructor(plane: Plane, domain: Domain2) {
        this.plane = plane;
        this.domain = domain;
    }

    getCorners() : Vector3[] {
        let corners = this.domain.corners();
        let corners3 = corners.map((c) => this.plane.pushToWorld(c.to3D()));
        return corners3;
    }
}