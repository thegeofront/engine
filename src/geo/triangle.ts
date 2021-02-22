import { Const } from "../math/const";
import { Vector2, Vector3 } from "../math/vector";
import { LineCurve2 } from "./line";
import { Plane } from "./plane";

export class Triangle2 {
    
    a: Vector2;
    b: Vector2;
    c: Vector2;

    constructor(a: Vector2, b: Vector2, c: Vector2) {
        this.a = a;
        this.b = b;
        this.c = c;
    }


    toBarycentric(point: Vector2) : Vector3 {

        let disa = this.a.disTo(point);
        let disb = this.b.disTo(point);
        let disc = this.c.disTo(point);

        let distotal = disa + disb + disc;

        return new Vector3(disa / distotal, disb / distotal, disc / distotal);
    }


    fromBarycentric(bari: Vector3) : Vector2 {

        let a = this.a.scaled(bari.x);
        let b = this.b.scaled(bari.y);
        let c = this.c.scaled(bari.z);

        return a.add(b).add(c);
    }


    closestPoint(point: Vector2) : Vector2 {

        // figure out roughly where the point is. 
        // note: 
        let ab = point.sign(this.a, this.b);
        let bc = point.sign(this.b, this.c);
        let ca = point.sign(this.c, this.a);

        // if its fully within, return it!
        if ((ab < 0 && bc < 0 && ca < 0) ||
            (ab > 0 && bc > 0 && ca > 0)) {
            console.log("fully inside!");
            return point;
        } else {
            let abs = Math.abs(ab);
            let bcs = Math.abs(bc);
            let cas = Math.abs(ca);

            if (abs < bcs && abs < cas) {
                // ab
                return new LineCurve2(this.a, this.b).closestPoint(point)!
            } else if (bcs < cas) {
                // bc
                return new LineCurve2(this.b, this.c).closestPoint(point)!
            } else {
                // ca
                return new LineCurve2(this.c, this.a).closestPoint(point)!;
            }
        }
    }
}

export class Triangle3 {
    
    a: Vector3;
    b: Vector3;
    c: Vector3;

    constructor(a: Vector3, b: Vector3, c: Vector3) {
        this.a = a;
        this.b = b;
        this.c = c;
    }


    getPlane() : Plane {
        return Plane.from3pt(this.a, this.b, this.c);
    }

    to2D(plane: Plane = Plane.WorldXY()) : Triangle2 {
        return new Triangle2(
            plane.pullToPlane(this.a).to2D(),
            plane.pullToPlane(this.b).to2D(),
            plane.pullToPlane(this.c).to2D(),
        )
    }

    closestPoint(point: Vector3) : Vector3 {
        let plane = this.getPlane();
        let [cp, _] = plane.closestPoint(point);
        let planeCP = plane.pullToPlane(cp);
        let planeTriangle = this.to2D(plane);

        return point;
    }

    toBarycentric(point: Vector3) : Vector3 {

        let disa = this.a.disTo(point);
        let disb = this.b.disTo(point);
        let disc = this.c.disTo(point);

        let distotal = disa + disb + disc;

        return new Vector3(disa / distotal, disb / distotal, disc / distotal);
    }

    fromBarycentric(bari: Vector3) : Vector3 {

        let a = this.a.scaled(bari.x);
        let b = this.b.scaled(bari.y);
        let c = this.c.scaled(bari.z);

        return a.add(b).add(c);

    }

}