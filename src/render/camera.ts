
// author : Jos Feenstra
// purpose : contain all logic regarding 

import { norm } from "@tensorflow/tfjs";
import { LineArray } from "../data/line-array";
import { Matrix4 } from "../math/matrix";
import { Ray } from "../math/ray";
import { Vector2, Vector3 } from "../math/vector"
import { InputState } from "../system/input-state";

export class Camera {

    pos: Vector3;
    offset: Vector3; // offset from rotation center
    z_offset: number;
    angleAlpha = 0; // rotation x 
    angleBeta = 0; // rotation y
    mousePos = Vector2.zero();
    mouseRay?: Ray;
    mouseRayVisual?: LineArray;

    // camera matrix properties
    fov = 20. * Math.PI / 100.;
    zFar = 10000.;
    zNear = 0.1;

    // other consts
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
        this.updateClick(state);
    }

    private updateClick(state: InputState) {
        // todo
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

        // deal with mouse
        let prevPos = this.mousePos.clone();
        this.mousePos = state.mousePos.clone();
        let delta = prevPos.clone().sub(this.mousePos);
        this.mouseRay = this.getMouseWorldRay(state.canvas.width, state.canvas.height);

        if (state.mouseRightDown) {
            this.angleAlpha += delta.y * 0.01;
            this.angleBeta += delta.x * -0.01;
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

    getCameraPoint() : Vector3 {
        return this.worldMatrix.inverse().multiplyVector(new Vector3(0,0,0));
    }

    getMouseWorldRay(canvasWidth: number, canvasHeight: number) : Ray {
        
        // get a ray from origin through mousepos 

        // mouse unit screen position: 
        //       -------------- -0.5
        //       |            |
        //       |      .(0,0)|
        //       |            | 
        //       -------------- 0.5
        //     -0.72        0.72     
        //    (0.72 = 0.5 * aspect)
        // 

        let size = 0.5 // size indicator of the fustrum
        let mp = this.mousePos;
        let aspect = canvasWidth / canvasHeight;
        let mouseUnitX = (-size + (mp.x / canvasWidth)) * aspect;
        let mouseUnitY = -size + (mp.y / canvasHeight);
        
        let f = size / Math.tan(this.fov / 2); // focal length 

        let invWorld = this.worldMatrix.inverse();
        let origin = invWorld.multiplyVector(new Vector3(0,0,0));

        // TODO instead of doing this, just extract the x, y, and z columns of invWorld 
        let iDestiny = invWorld.multiplyVector(new Vector3(1,0,0));
        let jDestiny = invWorld.multiplyVector(new Vector3(0,1,0));
        let kDestiny = invWorld.multiplyVector(new Vector3(0,0,-1));

        let ihat = iDestiny.clone().sub(origin).normalize();
        let jhat = jDestiny.clone().sub(origin).normalize();
        let khat = kDestiny.clone().sub(origin).normalize();

        let screenPoint = origin.clone()
            .add(khat.clone().scale(f))
            .add(ihat.clone().scale(mouseUnitX))
            .add(jhat.clone().scale(-mouseUnitY));
            
        this.mouseRayVisual = LineArray.fromLines([
            origin, screenPoint
        ])
        return new Ray(origin, screenPoint);
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

        // let z_plane = -1. / Math.tan(pi / 8.);        

        // projection to screen
        // let projection = Matrix4.newOrthographic(-1, 1, -1, 1, 0.1, 0.1);
        let projection = Matrix4.newPerspective(this.fov, aspect, this.zNear, this.zFar);
        return projection;
    }

    getTotalMatrix() : Matrix4 {

        return this.worldMatrix.multiply(this.projectMatrix);
    }
}
