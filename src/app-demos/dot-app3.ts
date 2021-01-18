// author : Jos Feenstra
// purpose : test with Renderers, Domains & Vectors

import { GeonImage } from "../img/Image";
import { Domain, Domain2, Domain3 } from "../math/domain";
import { Matrix3, Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/Vector";
import { InputState } from "../system/InputState"
import { App } from "../app/app"
import { DotRenderer3 } from "../render/dot-renderer3";

export class DotApp3 extends App {

    dots: Vector3[] = [];
    dirs: Vector3[] = [];

    bounds: Domain3;
    renderer: DotRenderer3;
    renderer2: DotRenderer3;
    matrix: Matrix4;

    camOffset = new Vector3(0,0,-3);
    camAlpha = 0;
    camBeta = 0;
    scale = 0;

    // unique constructors
    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        super();
        let n = 1;
        this.bounds = Domain3.new(-n, n, -n, n, -n, n);
        this.renderer = new DotRenderer3(gl, 10, [1,1,1,1], false);
        this.renderer2 = new DotRenderer3(gl, 10, [1,0,0,1], false);
        this.matrix = Matrix4.newIdentity();
        canvas.addEventListener("wheel", this.setMouseScroll.bind(this));
    }

    start() {
        // additional setup of state
        let normrange = 0.01;
        let count = 100;
        const normSpace = Domain3.new(-normrange, normrange, -normrange, normrange, -normrange, normrange);
        
        for (let i = 0 ; i < count; i++) {

            this.dots.push(this.bounds.elevate(Vector3.fromRandom()));
            this.dirs.push(normSpace.elevate(Vector3.fromRandom()));
        }
    }

    update(state: InputState) {
        for (let i = 0 ; i < this.dots.length; i++) {

            // these 'should' be pointers, but check this
            let dot = this.dots[i];
            let dir = this.dirs[i];

            // bounce of the edges
            if (!this.bounds.x.includes(dot.x))
                dir.x = -dir.x
            if (!this.bounds.y.includes(dot.y))
                dir.y = -dir.y
            if (!this.bounds.z.includes(dot.z))
                dir.z = -dir.z
            dot.add(dir);
        }  

        this.updateCamera(state);
    }

    mousePos = Vector2.zero();

    private setMouseScroll(e: WheelEvent) {
        // console.log("we be scrollin' now...")
        this.camOffset.z -= e.deltaY * 0.1;
    }

    private updateCamera(state: InputState) {

        if (state.mouseLeftPressed) {
            this.mousePos = state.mousePos.clone();
        }

        if (state.mouseLeftDown) {
            let newPos = state.mousePos.clone();
            let delta = state.mousePos.clone().sub(this.mousePos);
            this.mousePos = newPos;
            // console.log(delta);
            this.camAlpha -= delta.y * 0.01;
            this.camBeta -= delta.x * 0.01;
        }   
        

        if (state.IsKeyDown("-"))
            this.scale += 0.01;
        if (state.IsKeyDown("="))
            this.scale -= 0.01;

        if (state.IsKeyDown("q"))
            this.camOffset.z += 0.01;
        if (state.IsKeyDown("e"))
            this.camOffset.z -= 0.01;

        if (state.IsKeyDown("q"))
            this.camOffset.z += 0.01;
        if (state.IsKeyDown("e"))
            this.camOffset.z -= 0.01;            
        if (state.IsKeyDown("a"))
            this.camOffset.x += 0.01;
        if (state.IsKeyDown("d"))
            this.camOffset.x -= 0.01;
        if (state.IsKeyDown("s"))
            this.camOffset.y += 0.01;
        if (state.IsKeyDown("w"))
            this.camOffset.y -= 0.01;
    }

    draw(gl: WebGLRenderingContext) {
        const canvas = gl.canvas as HTMLCanvasElement;
        this.matrix = get3dMatrixSimple(canvas, this.camOffset, this.camAlpha, this.camBeta, this.scale);
        this.renderer.render(gl, this.matrix, this.dots);
        this.renderer2.render(gl, this.matrix, this.bounds.corners(Matrix4.newIdentity()));
    }
}


function get3dMatrixSimple(canvas: HTMLCanvasElement, pos: Vector3, angleA: number, angleB: number, scrollScale: number) {

    const pi = Math.PI;
    const fov = 45. * pi / 100.;
    const Z_FAR = 100.;
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