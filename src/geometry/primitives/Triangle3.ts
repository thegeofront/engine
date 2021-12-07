import { Vector3 } from "../../lib";
import { Plane } from "./Plane";
import { Triangle2 } from "./Triangle2";

export class Triangle3 {
    a: Vector3;
    b: Vector3;
    c: Vector3;

    constructor(a: Vector3, b: Vector3, c: Vector3) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    points(): Vector3[] {
        return [this.a, this.b, this.c];
    }

    getPlane(): Plane {
        return Plane.from3pt(this.a, this.b, this.c);
    }

    to2D(plane: Plane = Plane.WorldXY()): Triangle2 {
        return new Triangle2(
            plane.pullToPlane(this.a).to2D(),
            plane.pullToPlane(this.b).to2D(),
            plane.pullToPlane(this.c).to2D(),
        );
    }

    closestPoint(point: Vector3): Vector3 {
        let plane = this.getPlane();
        let [cp, _] = plane.closestPoint(point);
        let planeCP = plane.pullToPlane(cp);
        let planeTriangle = this.to2D(plane);

        return point;
    }

    // Transcribed from Christer Ericson's Real-Time Collision Detection:
    // http://realtimecollisiondetection.net/
    toBarycentric(point: Vector3): Vector3 {
        let v0 = this.b.subbed(this.a);
        let v1 = this.c.subbed(this.a);
        let v2 = point.subbed(this.a);
        let d00 = v0.dot(v0);
        let d01 = v0.dot(v1);
        let d11 = v1.dot(v1);
        let d20 = v2.dot(v0);
        let d21 = v2.dot(v1);
        let denom = d00 * d11 - d01 * d01;
        let v = (d11 * d20 - d01 * d21) / denom;
        let w = (d00 * d21 - d01 * d20) / denom;
        let u = 1.0 - v - w;

        return new Vector3(u, v, w);
    }

    fromBarycentric(bari: Vector3): Vector3 {
        let a = this.a.clone().scale(bari.x);
        let b = this.b.clone().scale(bari.y);
        let c = this.c.clone().scale(bari.z);

        return a.added(b).add(c);
    }


    /**
     * Calculate the intersection between this triangle and a plane.
     * 
     * This will be a line, or undefined.
     */
    xPlane(plane: Plane) : [Vector3, Vector3] | undefined {
        
        
        return undefined;
    }
}
