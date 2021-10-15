import { Const } from "./Const";
import { GeonMath } from "./Math";
import { Matrix4 } from "./Matrix4";
import { Random } from "./Random";
import { Util } from "./Util";
import { Vector2 } from "./Vector2";

export class Vector3 {
    // #region constructors
    constructor(public x: number, public y: number, public z: number) {}

    static new(x = 0, y = 0, z = 0) {
        return new Vector3(x, y, z);
    }

    get data() {
        return [this.x,this.y,this.z]; 
    }

    static from2d(v: Vector2) {
        return new Vector3(v.x, v.y, 0);
    }

    static calculateWheelOrder(vectors: Vector3[], ihat: Vector3, jhat: Vector3): number[] {
        // console.log("wheel order");
        // console.log("hats", ihat, jhat)

        let angles: number[] = [];
        vectors.forEach((v) => {
            angles.push(new Vector2(v.dot(ihat), v.dot(jhat)).angle());
        });
        // console.log("angles", angles);

        let ids: number[] = Util.range(vectors.length);
        ids.sort((a, b) => {
            return angles[a] - angles[b];
        });
        return ids;
    }

    static fromLerp(v1: Vector3, v2: Vector3, alpha: number): Vector3 {
        return new Vector3(
            v1.x + (v2.x - v1.x) * alpha,
            v1.y + (v2.y - v1.y) * alpha,
            v1.z + (v2.z - v1.z) * alpha,
        );
    }

    static fromArray(a: Float32Array | number[] | Array<number>): Vector3 {
        return new Vector3(a[0], a[1], a[2]);
    }

    static fromRandom(rng: Random): Vector3 {
        return new Vector3(rng.get(), rng.get(), rng.get());
    }

    static fromRandomUnit(rng: Random): Vector3 {
        // NOTE : this is not perfectly random, but good enough...
        return this.fromRandom(rng).sub(Vector3.new(0.5, 0.5, 0.5)).normalize();
    }

    static fromSphere(radius: number, theta: number, phi: number): Vector3 {
        const sinPhiRadius = Math.sin(phi) * radius;
        return this.constructor(
            sinPhiRadius * Math.sin(theta),
            Math.cos(phi) * radius,
            sinPhiRadius * Math.cos(theta),
        );
    }

    static fromCylinder(radius: number, theta: number, height: number): Vector3 {
        return this.constructor(radius * Math.sin(theta), height, radius * Math.cos(theta));
    }

    static fromLerpWeights(p1: Vector3, p2: Vector3, tP1: number, tP2: number, t: number) {
        if (Math.abs(t - tP1) < 0.00001) return p1;
        if (Math.abs(t - tP2) < 0.00001) return p2;
        if (Math.abs(tP1 - tP2) < 0.00001) return p1;
        let mu = (t - tP1) / (tP2 - tP1);

        return new Vector3(
            p1.x + mu * (p2.x - p1.x),
            p1.y + mu * (p2.y - p1.y),
            p1.z + mu * (p2.z - p1.z),
        );
    }

    // #endregion
    // #region defaults

    static zero() {
        return new Vector3(0, 0, 0);
    }

    static unitX() {
        return new Vector3(1, 0, 0);
    }

    static unitY() {
        return new Vector3(0, 1, 0);
    }

    static unitZ() {
        return new Vector3(0, 0, 1);
    }

    // #endregion
    // #region basics

    toArray() {
        return new Float32Array([this.x, this.y, this.z]);
    }

    set(x: number, y: number, z: number): Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    equals(v: Vector3): boolean {
        return v.x === this.x && v.y === this.y && v.z === this.z;
    }

    toString(): string {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }

    get xy() {
        return new Vector2(this.x, this.y);
    }

    /**
     * @deprecated
     */
    toVector2(): Vector2 {
        return this.xy;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3): Vector3 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    to2D(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    // #endregion
    // #region math like vector2

    largestValue(): number {
        return Math.max(this.x, this.y, this.z);
    }

    added(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    add(v: Vector3): Vector3 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    subbed(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    sub(v: Vector3): Vector3 {
        (this.x -= v.x), (this.y -= v.y), (this.z -= v.z);
        return this;
    }

    item(i: number) {
        switch (i) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return 1;
            default:
                throw "nope";
        }
    }

    scaled(v: number): Vector3 {
        return new Vector3(this.x * v, this.y * v, this.z * v);
    }

    scale(v: number): Vector3 {
        this.x *= v;
        this.y *= v;
        this.z *= v;
        return this;
    }

    mul(v: Vector3): Vector3 {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }

    multiplied(v: Vector3): Vector3 {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    divVector(v: Vector3): Vector3 {
        return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    }

    divided(value: number): Vector3 {
        return new Vector3(this.x / value, this.y / value, this.z / value);
    }

    div(value: number): Vector3 {
        (this.x /= value), (this.y /= value), (this.z /= value);
        return this;
    }

    minimumed(other: Vector3): Vector3 {
        return new Vector3(
            Math.min(this.x, other.x),
            Math.min(this.y, other.y),
            Math.min(this.z, other.z),
        );
    }

    maximumed(other: Vector3): Vector3 {
        return new Vector3(
            Math.max(this.x, other.x),
            Math.max(this.y, other.y),
            Math.max(this.z, other.z),
        );
    }

    clamped(min: Vector3, max: Vector3): Vector3 {
        return new Vector3(
            Math.max(min.x, Math.min(max.x, this.x)),
            Math.max(min.y, Math.min(max.y, this.y)),
            Math.max(min.z, Math.min(max.z, this.z)),
        );
    }

    clampScalared(min: number, max: number): Vector3 {
        return new Vector3(
            GeonMath.clamp(this.x, min, max),
            GeonMath.clamp(this.y, min, max),
            GeonMath.clamp(this.z, min, max),
        );
    }

    clampLengthed(min: number, max: number): Vector3 {
        const length = this.length();
        return this.div(length || 1).scale(Math.max(min, Math.min(max, length)));
    }

    floored(): Vector3 {
        return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    ceiled(): Vector3 {
        return new Vector3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }

    rounded(): Vector3 {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    roundedToZero(): Vector3 {
        return new Vector3(
            this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x),
            this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y),
            this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z),
        );
    }

    negate(): Vector3 {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    negated(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    angle(other: Vector3, normal: Vector3) {
        let thisProjected = this.subbed(normal.scaled(this.dot(normal)));
        let otherProjected = other.subbed(normal.scaled(other.dot(normal)));

        console.log(thisProjected);
        console.log(otherProjected);
        return 0;
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(other: Vector3): Vector3 {
        const ax = this.x,
            ay = this.y,
            az = this.z;
        const bx = other.x,
            by = other.y,
            bz = other.z;

        return new Vector3(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
    }

    getLengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length(): number {
        return Math.sqrt(this.getLengthSquared());
    }

    manhat(): number {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    normalize(): Vector3 {
        return this.div(this.length() || 1);
    }

    normalized(): Vector3 {
        return this.divided(this.length() || 1);
    }

    isNormal(): boolean {
        return Math.abs(this.length() - 1) < Const.TOLERANCE;
    }

    disTo(v: Vector3): number {
        return Math.sqrt(this.disToSquared(v));
    }

    disToSquared(v: Vector3): number {
        const dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    disToManhat(v: Vector3): number {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }

    setLength(length: number): Vector3 {
        return this.normalize().scale(length);
    }

    lerp(other: Vector3, alpha: number): Vector3 {
        return Vector3.fromLerp(this, other, alpha);
    }

    // #endregion
    // #region math specific

    projectOnVector(other: Vector3) {
        // use dot product to project this vector on the other vector
        const denominator = other.getLengthSquared();
        if (denominator === 0) return this.set(0, 0, 0);
        const scalar = other.dot(this) / denominator;
        return this.copy(other).scale(scalar);
    }

    projectedOnPlane(normal: Vector3) {
        // project a vector
        _vector.copy(this).projectOnVector(normal);
        return this.minimumed(_vector);
    }

    mirrored(normal: Vector3) {
        // mirror incident vector off plane orthogonal to normal
        // normal is assumed to have unit length
        return this.minimumed(_vector.copy(normal).scale(2 * this.dot(normal)));
    }

    rotated(axis: Vector3, angle: number): Vector3 {
        let mat = Matrix4.newAxisRotation(axis, angle);
        return mat.multiplyVector(this);
    }
}

const _vector = new Vector3(0, 0, 0);
