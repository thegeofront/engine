// name:    plane.ts
// author:  Jos Feenstra
// purpose: definition of a 3d plane. 
// todo:    turn Center, Ihat, Jhat, Khat construction to an actual matrix

import { Vector3Array } from "../data/vector-array";
import { Const } from "../math/const";
import { Matrix4 } from "../math/matrix";
import { Stat } from "../math/statistics";
import { Vector2, Vector3 } from "../math/vector";

export class Plane {
    
    _matrix!: Matrix4;
    // _inverse!: Matrix4; // NOTE: currently im not caching this. Might be needed.

    // NOTE : d is not really needed anymore...
    constructor(m: Matrix4) {
        this._matrix = m;
    }

    static fromPVV(a: Vector3, v1: Vector3, v2: Vector3) {

        // TODO check if we still need this -1 thing 
        let khat = v1.clone().cross(v2).normalize(); //.scale(-1);

        let center = a.clone();
        let ihat = v1.normalize()
        let jhat = v1.clone().cross(khat);
        
        let mat = Plane.planeMatrixFromVecs(center, ihat, jhat, khat);
        return new Plane(mat)
    }

    static from3pt(a: Vector3, b: Vector3, c: Vector3) {
        let v1 = b.clone().sub(a);
        let v2 = c.clone().sub(a);
        return this.fromPVV(a, v1, v2);
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

        let mean = pts.mean();
        let cov = Stat.cov(pts);
        let [eigValues, eigVectors] = Stat.eig(cov);
        console.log(eigValues);

        let biggestEigenVector = Vector3.fromArray(eigVectors.getColumn(0));
        let secondBiggestEigenVector = Vector3.fromArray(eigVectors.getColumn(1))

        return Plane.fromPVV(mean, biggestEigenVector, secondBiggestEigenVector);
    }

    static fromXYLeastSquares(pts: Vector3Array) : Plane {
        // quite specific, but this was needed.
        let mean = pts.mean();
        return Plane.WorldXY().transform(Matrix4.newTranslation(mean.x, mean.y, mean.z));       
    }

    static planeMatrixFromVecs(c: Vector3, i: Vector3, j: Vector3, k: Vector3) {

        return new Matrix4([
            i.x, i.y, i.z, 0,
            j.x, j.y, j.z, 0,
            k.x, k.y, k.z, 0,
            c.x, c.y, c.z, 1,
        ]);
    }

    public get ihat() {return Vector3.fromArray(this._matrix.getRow(0))}
    public get jhat() {return Vector3.fromArray(this._matrix.getRow(1))}
    public get khat() {return Vector3.fromArray(this._matrix.getRow(2))}
    public get center() {return Vector3.fromArray(this._matrix.getRow(3))}
    public get matrix() {return this._matrix.clone()}

    public get normal() {return this.khat}
    public get d() : number {return this.closestPoint(Vector3.zero())[1]}

    public set ihat(v: Vector3)   { this._matrix.setRow(0, [v.x, v.y, v.z, 0]);}
    public set jhat(v: Vector3)   { this._matrix.setRow(1, [v.x, v.y, v.z, 0]);}
    public set khat(v: Vector3)   { this._matrix.setRow(2, [v.x, v.y, v.z, 0]);}
    public set center(v: Vector3) { this._matrix.setRow(3, [v.x, v.y, v.z, 1]);}
    public set matrix(m: Matrix4) { this._matrix = m;}

    public get inverse() {return this._matrix.inverse()}

    clone() {
        return new Plane(this._matrix.clone());
    }

    transform(m: Matrix4) : Plane {
        this._matrix = this._matrix.multiply(m);
        return this;
    }

    move(origin: Vector3) {
        this.center = origin;
        return this;
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