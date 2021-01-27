import { Matrix4 } from "../math/matrix";
import { Vector3 } from "../math/vector";

// 'trait'. something which can be transformed with the magical force of 4x4 matrices 
export class Transformable {
    
    constructor() {

    }

    transform(m: Matrix4) {
        return this;
    }

    rotateX(radians: number) {
        let rotater = Matrix4.newXRotation(radians);
        // etc...
    }

    rotateY(radians: number) {
        let rotater = Matrix4.newYRotation(radians);
        // etc...
    }

    rotateZ(radians: number) {
        let rotater = Matrix4.newZRotation(radians);
        // etc...
    }

    rotate(radians: number, axis: Vector3) {
        let rotater = Matrix4.newAxisRotation(axis, radians);
        // etc...
    }
    
    move(m: Vector3) {
        let mover = Matrix4.newScaler(m.x, m.y, m.z);
        // etc... 
    }

    scale(s: Vector3) {

        let scaler = Matrix4.newScaler(s.x, s.y, s.z);
        // etc..
    }
}