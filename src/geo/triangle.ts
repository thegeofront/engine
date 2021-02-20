import { Vector2, Vector3 } from "../math/vector";

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

        let a = this.a.scale(bari.x);
        let b = this.b.scale(bari.y);
        let c = this.c.scale(bari.z);

        return a.add(b).add(c);

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

    closestPoint(point: Vector3) : Vector3 {
        
        console.log("TODO");
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

        let a = this.a.clone().scale(bari.x);
        let b = this.b.clone().scale(bari.y);
        let c = this.c.clone().scale(bari.z);

        return a.add(b).add(c);

    }

}