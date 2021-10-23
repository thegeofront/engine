// NOTE: maybe matrix 3 should be removed...
// 3x3 matrix of floats used for 2d math

import { FloatMatrix } from "../lib";
import { Matrix4 } from "./Matrix4";
import { Vector2 } from "./Vector2";

// inspired by Gregg Tavares.
export class Matrix3 extends FloatMatrix {
    constructor(data: number[] = []) {
        super(3, 3, data);
    }

    static fromMat4(mat4: Matrix4) {
        let d = mat4.data;
        return new Matrix3([
            d[0], d[1], d[2],
            d[4], d[5], d[6],
            d[8], d[9], d[10]
        ]);
    }
    

    static new(data = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {
        return new Matrix3(data);
    }

    static newIdentity(): Matrix3 {
        return new Matrix3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    static newProjection(width: number, height: number): Matrix3 {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return new Matrix3([2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1]);
    }

    static newTranslation(dx: number, dy: number): Matrix3 {
        return new Matrix3([1, 0, 0, 0, 1, 0, dx, dy, 1]);
    }

    // angle in radians
    static newRotation(r: number): Matrix3 {
        var c = Math.cos(r);
        var s = Math.sin(r);
        return new Matrix3([c, -s, 0, s, c, 0, 0, 0, 1]);
    }

    static newScalar(sx: number, sy: number) {
        return new Matrix3([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
    }

    toMat4(): Matrix4 {
        let d = this.data;
        return new Matrix4([
            d[0],
            d[1],
            0,
            d[2],
            d[3],
            d[4],
            0,
            d[5],
            0,
            0,
            1,
            0,
            d[6],
            d[7],
            0,
            d[8],
        ]);
    }

    toMat4Rot(): Matrix4 {
        let d = this.data;
        return new Matrix4([
            d[0],
            d[1],
            d[2],
            0,
            d[3],
            d[4],
            d[5],
            0,
            d[6],
            d[7],
            d[8],
            0,
            0,
            0,
            0,
            1,
        ]);
    }

    project(width: number, height: number): Matrix3 {
        return this.multiply(Matrix3.newProjection(width, height));
    }

    translateN(dx: number, dy: number): Matrix3 {
        return this.multiply(Matrix3.newTranslation(dx, dy));
    }

    translate(v: Vector2): Matrix3 {
        return this.multiply(Matrix3.newTranslation(v.x, v.y));
    }

    rotate(r: number): Matrix3 {
        return this.multiply(Matrix3.newRotation(r));
    }

    scale(sx: number, sy: number): Matrix3 {
        return this.multiply(Matrix3.newScalar(sx, sy));
    }

    // multiply two m3's
    multiply(other: Matrix3): Matrix3 {
        let a = this.data;
        let b = other.data;

        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];

        return new Matrix3([
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ]);
    }

    // transform a vector. RECYCLE IT
    transformVector(v: Vector2): Vector2 {
        let m = this.data;
        let v0 = v.x;
        let v1 = v.y;
        let d = v0 * m[0 * 3 + 2] + v1 * m[1 * 3 + 2] + m[2 * 3 + 2];
        v.x = (v0 * m[0 * 3 + 0] + v1 * m[1 * 3 + 0] + m[2 * 3 + 0]) / d;
        v.y = (v0 * m[0 * 3 + 1] + v1 * m[1 * 3 + 1] + m[2 * 3 + 1]) / d;
        return v;
    }

    // return the inverse of this matrix
    inverse(): Matrix3 {
        // ive got no idea what is happening here,
        // but apparantly, this is how you inverse a 3x3 matrix.
        let m = this.data;
        var t00 = m[1 * 3 + 1] * m[2 * 3 + 2] - m[1 * 3 + 2] * m[2 * 3 + 1];
        var t10 = m[0 * 3 + 1] * m[2 * 3 + 2] - m[0 * 3 + 2] * m[2 * 3 + 1];
        var t20 = m[0 * 3 + 1] * m[1 * 3 + 2] - m[0 * 3 + 2] * m[1 * 3 + 1];

        // discriminant
        var d = 1.0 / (m[0 * 3 + 0] * t00 - m[1 * 3 + 0] * t10 + m[2 * 3 + 0] * t20);
        this.setData([
            d * t00,
            -d * t10,
            d * t20,
            -d * (m[1 * 3 + 0] * m[2 * 3 + 2] - m[1 * 3 + 2] * m[2 * 3 + 0]),
            d * (m[0 * 3 + 0] * m[2 * 3 + 2] - m[0 * 3 + 2] * m[2 * 3 + 0]),
            -d * (m[0 * 3 + 0] * m[1 * 3 + 2] - m[0 * 3 + 2] * m[1 * 3 + 0]),
            d * (m[1 * 3 + 0] * m[2 * 3 + 1] - m[1 * 3 + 1] * m[2 * 3 + 0]),
            -d * (m[0 * 3 + 0] * m[2 * 3 + 1] - m[0 * 3 + 1] * m[2 * 3 + 0]),
            d * (m[0 * 3 + 0] * m[1 * 3 + 1] - m[0 * 3 + 1] * m[1 * 3 + 0]),
        ]);
        return this;
    }
}
