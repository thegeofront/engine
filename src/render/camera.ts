
// author : Jos Feenstra
// purpose : contain all logic regarding 

import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector"
import { InputState } from "../system/input-state";

export class Camera {

    pos: Vector3;
    offset: Vector3; // offset from rotation center
    z_offset: number;
    angleAlpha = 0; // rotation x 
    angleBeta = 0; // rotation y
    mousePos = Vector2.zero();

    speed = 1;

    worldMatrix: Matrix4;
    projectMatrix: Matrix4;    

    constructor(canvas: HTMLCanvasElement, z_offset = 1) {
        this.pos = new Vector3(0,0,0);
        this.z_offset = -z_offset;
        this.offset = new Vector3(0,0, -z_offset);

        this.worldMatrix = this.getWorldMatrix();
        this.projectMatrix = this.getProjectionMatrix(canvas);
    }

    update(state: InputState) {
        this.updateControls(state);
        this.worldMatrix = this.getWorldMatrix();
        this.projectMatrix = this.getProjectionMatrix(state.canvas);
    }

    private updateControls(state: InputState) {

        this.offset.z = this.z_offset - state.scrollValue * 0.5;
        if (state.IsKeyPressed("Shift")) {
            this.speed *= 2;
            console.log("speed is now: " + this.speed);
        }
        if (state.IsKeyPressed("Control")) {
            this.speed = Math.max(this.speed * 0.5, 0.1);
            console.log("speed is now: " + this.speed);
        }

        if (state.mouseRightPressed || state.mouseMiddlePressed) {
            this.mousePos = state.mousePos.clone();
        }

        if (state.mouseRightDown || state.mouseMiddleDown) {
            let newPos = state.mousePos.clone();
            let delta = state.mousePos.clone().sub(this.mousePos);
            this.mousePos = newPos;
            // console.log(delta);
            this.angleAlpha -= delta.y * 0.01;
            this.angleBeta -= delta.x * -0.01;
        }   

        function relativeUnitY(angle: number) {
            let m = Matrix4.newZRotation(angle);
            return m.multiplyVector(Vector3.unitY());
        }

        function relativeUnitX(angle: number) {
            let m = Matrix4.newZRotation(angle);
            return m.multiplyVector(Vector3.unitX());
        }

        if (state.IsKeyDown("s"))
            this.pos.add(relativeUnitY(-this.angleBeta).scale(0.01 * this.speed));
        if (state.IsKeyDown("w"))
            this.pos.add(relativeUnitY(-this.angleBeta).scale(-0.01 * this.speed));           
        if (state.IsKeyDown("a"))
            this.pos.add(relativeUnitX(-this.angleBeta).scale(0.01 * this.speed));
        if (state.IsKeyDown("d"))
            this.pos.add(relativeUnitX(-this.angleBeta).scale(-0.01 * this.speed));
        if (state.IsKeyDown("q"))
            this.pos.z += 0.01 * this.speed;
        if (state.IsKeyDown("e"))
            this.pos.z -= 0.01 * this.speed;
    }

    getWorldMatrix() : Matrix4 {
        let offset = this.offset;
        let angleA = this.angleAlpha;
        let angleB = this.angleBeta;
    
        // translate so z means 'up'
        let yzFlip = new Matrix4([
            1,0,0,0,
            0,0,1,0,
            0,1,0,0,
            0,0,0,1,
        ])

        // translated to fit screen
        let position = Matrix4.newTranslation(this.pos.x, this.pos.y, this.pos.z);
        let mOffset = Matrix4.newTranslation(offset.x, offset.y, offset.z);
        
        // rotated by user
        let x_rotation = Matrix4.newXRotation(angleA);
        let z_rotation = Matrix4.newZRotation(angleB);
        let rotation = z_rotation.multiply(x_rotation);
        
        // let transform = mOffset.multiply(rotation).multiply(position);
    
        let transform = position.multiply(rotation).multiply(mOffset);
        return transform;
    }

    getProjectionMatrix(canvas: HTMLCanvasElement) : Matrix4 {

        // aspects
        let aspect = canvas.width / canvas.height; // note: this should be constant
        const pi = Math.PI;
        const fov = 20. * pi / 100.;
        const Z_FAR = 10000.;
        const Z_NEAR = 0.1;
        let z_plane = -1. / Math.tan(pi / 8.);        

        // projection to screen
        // let projection = Matrix4.newOrthographic(-1, 1, -1, 1, 0.1, 0.1);
        let projection = Matrix4.newPerspective(fov, aspect, Z_NEAR, Z_FAR);
        return projection;
    }

    getTotalMatrix() : Matrix4 {

        return this.worldMatrix.multiply(this.projectMatrix);
    }
}
