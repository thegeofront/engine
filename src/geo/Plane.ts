// name:    plane.ts
// author:  Jos Feenstra
// purpose: definition of a 3d plane. 
// todo:    turn Center, Ihat, Jhat, Khat construction to an actual matrix

import { Vector3Array } from "../data/vector-array";
import { Const } from "../math/const";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";

export class Plane {
    
    _matrix!: Matrix4;
    // _inverse!: Matrix4; // NOTE: currently im not caching this. Might be needed.

    _d!: number; // TODO dynamically calculate d, right now i dont know how

    // NOTE : d is not really needed anymore...
    constructor(m: Matrix4, d: number) {
        this._matrix = m;
        this._d = d;
    }

    static from3pt(a: Vector3, b: Vector3, c: Vector3) {
        let v1 = b.clone().sub(a);
        let v2 = c.clone().sub(a);

        // check if we still need this -1 thing 
        let khat = v1.clone().cross(v2).normalize().scale(-1);

        let center = a.clone();
        let ihat = v1.normalize()
        let jhat = v1.clone().cross(khat);
        
        let mat = Plane.planeMatrixFromVecs(center, ihat, jhat, khat);
        let d = khat.clone().dot(c) * -1;
        return new Plane(mat, d)
    }

    static WorldXY(): Plane {
        return Plane.from3pt(Vector3.zero(), Vector3.unitX(), Vector3.unitY());
    }

    static WorldYZ(): Plane {
        return Plane.from3pt(Vector3.zero(), Vector3.unitY(), Vector3.unitZ());
    }

    static WorldXZ(): Plane {
        return Plane.from3pt(Vector3.zero(), Vector3.unitX(), Vector3.unitZ());
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

    public get ihat() {return Vector3.fromArray(this._matrix.getRow(0))}
    public get jhat() {return Vector3.fromArray(this._matrix.getRow(1))}
    public get khat() {return Vector3.fromArray(this._matrix.getRow(2))}
    public get center() {return Vector3.fromArray(this._matrix.getRow(3))}
    public get matrix() {return this._matrix.clone()}

    public set ihat(v: Vector3)   { this._matrix.setRow(0, [v.x, v.y, v.z, 0]);}
    public set jhat(v: Vector3)   { this._matrix.setRow(1, [v.x, v.y, v.z, 0]);}
    public set khat(v: Vector3)   { this._matrix.setRow(2, [v.x, v.y, v.z, 0]);}
    public set center(v: Vector3) { this._matrix.setRow(3, [v.x, v.y, v.z, 1]);}
    public set matrix(m: Matrix4) { this._matrix = m;}



    public get inverse() {return this._matrix.inverse()}

    static planeMatrixFromVecs(c: Vector3, i: Vector3, j: Vector3, k: Vector3) {

        return new Matrix4([
            i.x, i.y, i.z, 0,
            j.x, j.y, j.z, 0,
            k.x, k.y, k.z, 0,
            c.x, c.y, c.z, 1,
        ]);
    }

    transform(m: Matrix4) : Plane {
        this._matrix = this._matrix.multiply(m);
        return this;
    }

    getPlaneParams() : [number, number, number, number] {
        // get a, b, c, and d parameters
        let k = this.khat;
        return [k.x, k.y, k.z, this._d];
    }

    getRenderLines() : Vector3Array {
        let count = Const.PLANE_RENDER_LINECOUNT;
        let dis = Const.PLANE_RENDER_LINEDISTANCE;
        let disSmall = dis / 10;
        let halfTotalSize = ((count-1) * dis) / 2;

        // 2 vectors per line, 2 lines per count
        // plus 5 lines, for ihat and jhat icons 
        let lines = new Vector3Array(count * 4 + 5 * 2);

        // x lines
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + dis * i;
            lines.setVector(i*2,     new Vector3(t, -halfTotalSize, 0));
            lines.setVector(i*2 + 1, new Vector3(t,  halfTotalSize, 0));
        }

        // y lines 
        for(let i = 0 ; i < count; i++) {
            let t = -halfTotalSize + dis * i;
            lines.setVector(2*count + i*2,     new Vector3(-halfTotalSize, -halfTotalSize + dis * i, 0));
            lines.setVector(2*count + i*2 + 1, new Vector3( halfTotalSize, -halfTotalSize + dis * i ,0));
        }

        // icon I  to show ihat
        let iconLine1 = lines.count() - 10;
        lines.setVector(iconLine1, new Vector3(halfTotalSize+disSmall,-disSmall, 0));
        lines.setVector(iconLine1+1, new Vector3(halfTotalSize+disSmall*4, disSmall, 0));

        let iconLine2 = lines.count() - 8;
        lines.setVector(iconLine2, new Vector3(halfTotalSize+disSmall, disSmall, 0));
        lines.setVector(iconLine2+1, new Vector3(halfTotalSize+disSmall*4, -disSmall, 0));

        // icon II to show jhat
        let iconLine3 = lines.count() - 6;
        lines.setVector(iconLine3, new Vector3(0, halfTotalSize+disSmall*2.5, 0));
        lines.setVector(iconLine3+1, new Vector3(disSmall, halfTotalSize+disSmall*4, 0));

        let iconLine4 = lines.count() - 4;
        lines.setVector(iconLine4, new Vector3(disSmall, halfTotalSize+disSmall, 0));
        lines.setVector(iconLine4+1, new Vector3(-disSmall, halfTotalSize+disSmall*4, 0));

        // icon III to show khat / normal direction
        let iconLine5 = lines.count() - 2;
        lines.setVector(iconLine5, new Vector3(0, 0, 0));
        lines.setVector(iconLine5+1, new Vector3(0, 0, dis));

        // finally, transform everything to worldspace
        lines.forEach((v) => this.pushToWorld(v));

        return lines
    }

    // NOTE: pulling is inefficient since i do not cache the inverse.
    pullToPlane(p: Vector3) : Vector3 {
        return this.inverse.multiplyVector(p);
    }

    pushToWorld(p: Vector3) : Vector3 {
        return this.matrix.multiplyVector(p);
    }

    closestPoint(p: Vector3) : [Vector3, number] {
        let pulled = this.pullToPlane(p);
        let distance = pulled.z;
        pulled.z = 0;
        let vec = this.pushToWorld(pulled);
        return [vec, distance];
    }

    // closestPoint(p: Vector3) : [Vector3, number] {
    //     // project a point to the plane using the shortest distance
    //     // NOTE: this method is a sort of half inverse matrix approach. 
    //     //       using the inverse of the plane matrix might just be easier.
    //     let [a,b,c,d] = this.getPlaneParams();
    //     let normalizer = ((a**2 + b**2 + c**2)**0.5);
    //     let signed_distance = a*p.x + b*p.y + c*p.z + d / normalizer;

    //     let vx = (a / normalizer) * -signed_distance;
    //     let vy = (b / normalizer) * -signed_distance;
    //     let vz = (c / normalizer) * -signed_distance;

    //     let vec = p.clone().add(new Vector3(vx, vy, vz));
    //     return [vec, signed_distance]
    // }

}