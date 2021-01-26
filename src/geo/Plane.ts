// name:    plane.ts
// author:  Jos Feenstra
// purpose: definition of a 3d plane. 

import { Vector3Array } from "../data/vector-array";
import { Const } from "../math/const";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";

export class Plane {
    
    center!: Vector3;
    ihat!: Vector3;
    jhat!: Vector3;
    khat!: Vector3;
    d!: number;

    constructor(a: Vector3, b: Vector3, c: Vector3) {
        this.setDataFromPoints(a, b, c);
    }

    private setDataFromPoints(a: Vector3, b: Vector3, c: Vector3) {
        let v1 = c.clone().sub(a);
        let v2 = b.clone().sub(a);

        // check if we still need this -1 thing 
        let khat = v1.clone().cross(v2).normalize().scale(-1);

        this.center = a.clone();
        this.ihat = v1.normalize()
        this.jhat = v1.clone().cross(khat);
        this.khat = khat;
        this.d = khat.clone().dot(c) * -1;
    }

    static WorldXY(): Plane {
        return new Plane(Vector3.zero(), Vector3.unitX(), Vector3.unitY());
    }

    static WorldYZ(): Plane {
        return new Plane(Vector3.zero(), Vector3.unitY(), Vector3.unitZ());
    }

    static WorldXZ(): Plane {
        return new Plane(Vector3.zero(), Vector3.unitX(), Vector3.unitZ());
    }

    static fromLeastSquares(pts: Vector3Array) : Plane{
        // TODO THIS IS HARD
        return Plane.WorldXY();
    }

    static fromXYLeastSquares(pts: Vector3Array) : Plane {
        // quite specific, but this was needed.
        let mean = pts.mean();
        return Plane.WorldXY().transform(Matrix4.newTranslation(mean.x, mean.y, mean.z));       
    }

    transform(m: Matrix4) : Plane {
        // this is not how it should work, but it does the job
        // NOTE: i really should overhaul how transforms work...
        let abc = Vector3Array.fromNativeArray([
            this.center,
            this.center.clone().add(this.ihat),
            this.center.clone().add(this.jhat),
        ]);

        console.log(abc.toNativeArray());
        m.multiplyVectors(abc);
        console.log(abc.toNativeArray());

        this.setDataFromPoints(abc.getVector(0), abc.getVector(1), abc.getVector(2));
        return this;
    }

    getPlaneParams() : [number, number, number, number] {
        // get a, b, c, and d parameters
        let k = this.khat;
        return [k.x, k.y, k.z, this.d];
    }

    getRenderLines() : Vector3Array {
        let count = Const.PLANE_RENDER_LINECOUNT;
        let distance = Const.PLANE_RENDER_LINEDISTANCE;
        let halfTotalSize = ((count-1) * distance) / 2;

        // 2 vectors per line, 2 lines per count
        let lines = new Vector3Array(count * 4);

        // x lines
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + distance * i;
            lines.setVector(i*2,     this.planeToWorld(new Vector3(t, -halfTotalSize, 0)));
            lines.setVector(i*2 + 1, this.planeToWorld(new Vector3(t,  halfTotalSize, 0)));
        }

        // y lines 
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + distance * i;
            lines.setVector(2*count + i*2,     this.planeToWorld(new Vector3(-halfTotalSize, -halfTotalSize + distance * i, 0)));
            lines.setVector(2*count + i*2 + 1, this.planeToWorld(new Vector3( halfTotalSize, -halfTotalSize + distance * i ,0)));
        }
        return lines
    }

    worldToPlane(p: Vector3) : Vector3 {
        // go from world coordinate system to plane coordinate system (expressed in i, j and khat)
        let [point, distance] = this.closestPoint(p);
        
        
        let vec = point.sub(this.center); // vec from center to this point on plane

        let vx = vec.clone().dot(this.ihat); // x component
        let vy = vec.clone().dot(this.jhat); // y component
        
        return new Vector3(vx, vy, distance);
    }

    planeToWorld(p: Vector3) : Vector3 {
        // go from plane coordinate system to world coordinate system
        return this.center.clone()
            .add(this.ihat.clone().scale(p.x))
            .add(this.jhat.clone().scale(p.y))
            .add(this.khat.clone().scale(p.z));
    }

    project(p: Vector3) : Vector3 {
        console.log(p);
        let [vec, d] = this.closestPoint(p);
        console.log(vec);
        return vec;
    }

    closestPoint(p: Vector3) : [Vector3, number] {
        // project a point to the plane using the shortest distance
        // TODO this could be faster
        let [a,b,c,d] = this.getPlaneParams();
        let normalizer = ((a**2 + b**2 + c**2)**0.5);
        let signed_distance = a*p.x + b*p.y + c*p.z + d / normalizer;

        let vx = (a / normalizer) * -signed_distance;
        let vy = (b / normalizer) * -signed_distance;
        let vz = (c / normalizer) * -signed_distance;

        let vec = p.clone().add(new Vector3(vx, vy, vz));
        return [vec, signed_distance]
    }

}