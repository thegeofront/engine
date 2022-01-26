// author: Jos Feenstra
// purpose: Quaternion to be used for rotation
// Inspired by:
// https://api.flutter.dev/flutter/vector_math/Quaternion-class.html


import { TileSolver } from "../algorithms/TileSolver";
import { Random } from "./Random";
import { Vector3 } from "./Vector3";

export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;


    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }


    static new() {
        return new Quaternion(0, 0, 0, 1);
    }


    static fromEuler(yaw: number, pitch: number, roll: number) {
        return new Quaternion(0,0,0,1).setEuler(yaw, pitch, roll);      
    }


    private setIndex(i: number, value: number) {
        switch(i) {
            case 0:
                this.x = value;
                return;
            case 1:
                this.y = value;
                return;
            case 2:
                this.z = value;
                return;
            case 3:
                this.w = value;
                return;
            default: 
                return;
        } 
    }


    lengthSquared() {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    set(x=0.0, y=0.0, z=0.0, w=0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }


    copy(q: Quaternion) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;

        return this;
    } 


    inverse() {
        const scalar = 1.0 / this.lengthSquared();
        this.w = this.w * scalar;
        this.z = -this.z * scalar;
        this.y = -this.y * scalar;
        this.x = -this.x * scalar;
    }


    add(other: Quaternion) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        this.w += other.w;

        return this;
    }


    addN(x=0.0, y=0.0, z=0.0, w=0.0) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.w += w;

        return this;
    }


    setEuler(yaw: number, pitch: number, roll: number) {
        const halfYaw = yaw * 0.5;
        const halfPitch = pitch * 0.5;
        const halfRoll = roll * 0.5;
        const cosYaw   = Math.cos(halfYaw);
        const sinYaw   = Math.sin(halfYaw);
        const cosPitch = Math.cos(halfPitch);
        const sinPitch = Math.sin(halfPitch);
        const cosRoll  = Math.cos(halfRoll);
        const sinRoll  = Math.sin(halfRoll);
        this.x = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
        this.y = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
        this.z = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
        this.w = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
        return this;
    }


    setAxisAngle(axis: Vector3, radians: number) {
        const length = axis.length();
        if (length == 0.0) {
            return;
        }
        const halfSin = Math.sin(radians * 0.5) / length;

        this.x = axis.x * halfSin;
        this.y = axis.y * halfSin;
        this.z = axis.z * halfSin;
        this.w = Math.cos(radians * 0.5);

        return this;
    }

    /**
     * Same as 'setTwoVectors', but skips out on normalization for efficiencie's sake
     * This makes YOU responsible for giving me two normalized vectors :)
     */
    setTwoNormalizedVectors(a: Vector3, b: Vector3) {

        const c = a.dot(b);
        let angle = Math.acos(c);
        let axis = a.cross(b);

        if (Math.abs(1.0 + c) < 0.0005) {
            // c \approx -1 indicates 180 degree rotation
            angle = Math.PI;
            // [JF]: This is a common problem, 
            // a and b are parallel in opposite directions. We need any
            // vector as our rotation axis that is perpendicular.
            // Find one by taking the cross product of v1 with an appropriate unit axis
            if (a.x > a.y && a.x > a.z) {
                // v1 points in a dominantly x direction, so don't cross with that axis
                axis = a.cross(Vector3.unitY());
            } else {
                // Predominantly points in some other direction, so x-axis should be safe
                axis = a.cross(Vector3.unitX());
            }
        } else if (Math.abs(1.0 - c) < 0.0005) {
            // c \approx 1 is 0-degree rotation, axis is arbitrary
            angle = 0.0;
            axis = Vector3.unitX();
        }

        return this.setAxisAngle(axis.normalize(), angle);
    }

    /**
     * This is like plane.fromCVV, but just the vv part
     * NOTE: the plane class should probably be deleted eventually, it wont be needed anymore :)
     * TODO: Replace Plane with a Pose class, aka Transform without Scale
     */
    setTwoVectors(a: Vector3, b: Vector3) {
        return this.setTwoNormalizedVectors(a.normalized(), b.normalized());
    }


    setPose(a: Vector3, b: Vector3) {
        let i = a.normalized();
        let k = a.cross(b).normalized();
        let j = k.cross(a).normalized();

        return this.setFromMatrix(
            i.x, i.y, i.z, 
            j.x, j.y, j.z, 
            k.x, k.y, k.z
        );
    }


    /**
     * http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.html
     */
    multiply(q2: Quaternion) {
        const q1 = this;
        const x =  q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
        const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
        const z =  q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
        const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
        this.set(x,y,z,w);
    }

    /**
     * I dont know what this means yet ...
     */
    setStrangeNumbers(a: number, b: number, c: number) {
        const x0 = a;

        const r1 = Math.sqrt(1.0 - x0);
        const r2 = Math.sqrt(x0);

        const t1 = Math.PI * 2.0 * b;
        const t2 = Math.PI * 2.0 * c;
        const c1 = Math.cos(t1);
        const s1 = Math.sin(t1);
        const c2 = Math.cos(t2);
        const s2 = Math.sin(t2);

        this.x = s1 * r1;
        this.y = c1 * r1;
        this.z = s2 * r2;
        this.w = c2 * r2;
        
        return this;
    }

    setRandom(random: Random) {
        // From: "Uniform Random Rotations", Ken Shoemake, Graphics Gems III,
        // pg. 124-132.
        return this.setStrangeNumbers(random.get(), random.get(), random.get());
    }

    /**
     * Set from rotation matrix
     * PS: I'm trying to do this without constructing a M3 for efficiencies sake
     */
    setFromMatrix(
        r0=1, r1=0, r2=0, 
        r3=0, r4=1, r5=0, 
        r6=0, r7=0, r8=1) {
        
        // NOTE: this is unavoidable... unless we rewrite a whole bunch
        let r = [r0,r1,r2,r3,r4,r5,r6,r7,r8];
        let index = (row=0, col=0) => (col * 3) + row;

        // the trace of a matrix is the sum of diagonal entries 
        let trace = r0 + r4 + r8;

        if (trace > 0.0) {
            let s = Math.sqrt(trace + 1.0);
            this.w = s * 0.5;
            s = 0.5 / s;
            this.x = (r5 - r7) * s;
            this.y = (r6 - r2) * s;
            this.z = (r1 - r3) * s;
        } else {
            // i is largest out of r0, r4, r8
            const i = r0 < r4 ? (r4 < r8 ? 2 : 1) : (r0 < r8 ? 2 : 0);

            // TODO rewrite it verbose-style, it will be quicker, a la:
            // if (i == 0) {
            //     const j = 1;
            //     const k = 2;

            // } else if (i == 1) {
            //     const j = 2;
            //     const k = 0;

            // } else /* (i == 2) */ {
            //     const j = 0;
            //     const k = 1;
            // }

            const j = (i + 1) % 3;
            const k = (i + 2) % 3;
            
            let s = Math.sqrt(r[index(i, i)] - r[index(j, j)] - r[index(k, k)] + 1.0);
            this.setIndex(i, s * 0.5);
            s = 0.5 / s;
            this.setIndex(j, (r[index(j, i)] + r[index(i, j)]) * s);
            this.setIndex(k, (r[index(k, i)] + r[index(i, k)]) * s);
            this.w = (r[index(k, j)] - r[index(j, k)]) * s;
        }
        return this;
    }


    rotate(v: Vector3) {

        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        
        const tiw = w;
        const tiz = -z;
        const tiy = -y;
        const tix = -x;
        
        const tx = tiw * v.x + tix * 0.0 + tiy * v.z - tiz * v.y;
        const ty = tiw * v.y + tiy * 0.0 + tiz * v.x - tix * v.z;
        const tz = tiw * v.z + tiz * 0.0 + tix * v.y - tiy * v.x;
        const tw = tiw * 0.0 - tix * v.x - tiy * v.y - tiz * v.z;
        
        const result_x = tw * x + tx * w + ty * z - tz * y;
        const result_y = tw * y + ty * w + tz * x - tx * z;
        const result_z = tw * z + tz * w + tx * y - ty * x;
        
        v.x = result_x;
        v.y = result_y;
        v.z = result_z;
        
        return v;
    }

    rotated(v: Vector3) {
        return this.rotate(v.clone());
    }
}
