
// author : Jos Feenstra
// purpose : contain all logic regarding 

import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector"
import { InputState } from "../system/input-state";

export class Camera {

    offset: Vector3; // offset from rotation center
    angleAlpha = 0; // rotation x 
    angleBeta = 0; // rotation y
    mousePos = Vector2.zero();

    constructor(canvas: HTMLCanvasElement, z_offset = 3) {
        canvas.addEventListener("wheel", this.setMouseScroll.bind(this));
        this.offset = new Vector3(0,0, -z_offset);
    }

    private setMouseScroll(e: WheelEvent) {
        // console.log("we be scrollin' now...")
        this.offset.z -= e.deltaY * 0.1;
    }


    public updateWithControls(state: InputState) {

        if (state.mouseLeftPressed) {
            this.mousePos = state.mousePos.clone();
        }

        if (state.mouseLeftDown) {
            let newPos = state.mousePos.clone();
            let delta = state.mousePos.clone().sub(this.mousePos);
            this.mousePos = newPos;
            // console.log(delta);
            this.angleAlpha -= delta.y * 0.01;
            this.angleBeta -= delta.x * 0.01;
        }   
        
        if (state.IsKeyDown("q"))
            this.offset.z += 0.01;
        if (state.IsKeyDown("e"))
            this.offset.z -= 0.01;

        if (state.IsKeyDown("q"))
            this.offset.z += 0.01;
        if (state.IsKeyDown("e"))
            this.offset.z -= 0.01;            
        if (state.IsKeyDown("a"))
            this.offset.x += 0.01;
        if (state.IsKeyDown("d"))
            this.offset.x -= 0.01;
        if (state.IsKeyDown("s"))
            this.offset.y += 0.01;
        if (state.IsKeyDown("w"))
            this.offset.y -= 0.01;
    }

    getRenderToScreenMatrix(canvas: HTMLCanvasElement) : Matrix4 {
        
        let pos = this.offset;
        let angleA = this.angleAlpha;
        let angleB = this.angleBeta;
        
        const pi = Math.PI;
        const fov = 30. * pi / 100.;
        const Z_FAR = 1000.;
        const Z_NEAR = 0.1;
        let z_plane = -1. / Math.tan(pi / 8.);
        
        // aspects
        let aspect = canvas.width / canvas.height; // note: this should be constant
    
        // translated to fit screen
        let offset = Matrix4.newTranslation(pos.x, pos.y, pos.z);
        
        // rotated by user
        let x_rotation = Matrix4.newXRotation(angleA);
        let y_rotation = Matrix4.newYRotation(angleB);
        let rotation = x_rotation.multiply(y_rotation);
        
        let transform = offset.multiply(rotation);
    
        // projection to screen
        // let projection = Matrix4.newOrthographic(-1, 1, -1, 1, 0.1, 0.1);
        let projection = Matrix4.newPerspective(fov, aspect, Z_NEAR, Z_FAR);
    
        // return
        return projection.multiply(transform);
    }

}