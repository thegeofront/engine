// author : Jos Feenstra
// purpose : contain all logic regarding

import { Vector3, Vector2, Plane, Matrix4, InputState, GeonMath, Ray, Matrix3 } from "../../lib";


export class Camera {
    pos: Vector3;
    offset: Vector3; // offset from rotation center
    angleAlpha = 0; // rotation x
    angleBeta = 0; // rotation y
    mousePos = Vector2.zero();

    // camera matrix properties
    fov = (20 * Math.PI) / 100;
    zFar = 10000;
    zNear = 0.01;

    // other consts
    speed = 10;

    worldPlane = Plane.WorldXY();

    // ! means: dont worry, these will be set in the constructor
    totalMatrix!: Matrix4;
    worldMatrix!: Matrix4;
    projectMatrix!: Matrix4;
    inverseWorldMatrix!: Matrix4;
    inverseTotalViewMatrix!: Matrix4;

    // settings
    canMove: boolean;
    canControl: any;
    inverseTransposeMatrix!: Matrix4;
    
    constructor(canvas: HTMLCanvasElement, z_offset = 1, canMove = false, canControl = true) {
        this.canMove = canMove;
        this.canControl = canControl;

        this.pos = new Vector3(0, 0, 0);
        this.offset = new Vector3(0, 0, -z_offset);
        this.updateMatrices(canvas);
    }

    get zoom() {
        return this.offset.z;
    }

    set zoom(value: number) {
        this.offset.z = value;
    }

    static new(canvas: HTMLCanvasElement, zOffset = 1, canMove = false) {
        return new Camera(canvas, zOffset, canMove);
    }

    update(state: InputState, forceUpdate = true) : boolean {
        let hasChanged = this.updateControls(state);
        if (hasChanged || forceUpdate) {
            this.updateMatrices(state.canvas); // TODO only move if we have changed
        }
        this.updateClick(state);

        if (state.IsKeyPressed("p")) {
            console.log(
                `camera state: [${this.pos.x.toPrecision(5)}, ${this.pos.y.toPrecision(
                    5,
                )}, ${this.pos.z.toPrecision(5)}, ${this.zoom}, ${this.angleAlpha},${
                    this.angleBeta
                }]`,
            );

            // console.log(
            //     `printing camera status.
            //     pos: ${this.pos},
            //     offset: ${this.offset},
            //     speed: ${this.speed},
            //     alpha ${this.angleAlpha},
            //     beta: ${this.angleBeta}`,
            // );

            console.log("speed is now: " + this.speed);
        }
        return hasChanged;
    }

    // just a quick way of getting & setting

    getActualPosition() {
        // TODO MUST BE WAY QUICKER!!!
        return this.inverseWorldMatrix.multiplyVector(Vector3.zero());
    }

    getState(): number[] {
        return [this.pos.x, this.pos.y, this.pos.z, this.zoom, this.angleAlpha, this.angleBeta];
    }

    setState(state: number[]) {
        this.pos.x = state[0];
        this.pos.y = state[1];
        this.pos.z = state[2];
        this.zoom = state[3];
        this.angleAlpha = state[4];
        this.angleBeta = state[5];
    }

    set(offset: number, alpha: number, beta: number) {
        this.zoom = offset;
        this.angleAlpha = alpha;
        this.angleBeta = beta;
    }

    updateMatrices(canvas: HTMLCanvasElement) {

        // 1 : calculate world matrix
        let offset = this.offset;
        let angleA = this.angleAlpha;
        let angleB = this.angleBeta;

        // translate so z means 'up'
        // let yzFlip = new Matrix4([1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1]);

        // translated to fit screen
        let position = Matrix4.newTranslation(this.pos.x, this.pos.y, this.pos.z);
        let mOffset = Matrix4.newTranslation(offset.x, offset.y, offset.z);

        // rotated by user
        let x_rotation = Matrix4.newXRotation(angleA);
        let z_rotation = Matrix4.newZRotation(angleB);
        let rotation = z_rotation.multiply(x_rotation);
 
        // let transform = mOffset.multiply(rotation).multiply(position);
        let worldMatrix = position.multiply(rotation).multiply(mOffset);

        // 2 : project & total
        let projectMatrix = this.getProjectionMatrix(canvas); // THIS IS MORE OR LESS STATIC, CACHE IT!
        let totalMatrix = worldMatrix.multiplied(projectMatrix);

        // translation = 0
        var viewDirectionMatrix = Matrix4.newCopy(worldMatrix);
        viewDirectionMatrix.data[12] = 0;
        viewDirectionMatrix.data[13] = 0;
        viewDirectionMatrix.data[14] = 0;

        let totalViewMatrix = rotation.multiplied(projectMatrix);

        this.worldMatrix = worldMatrix;
        this.projectMatrix = projectMatrix;
        this.totalMatrix = totalMatrix; 

        this.inverseWorldMatrix = this.worldMatrix.inverse();
        this.inverseTransposeMatrix = this.inverseWorldMatrix.transpose(); 
        this.inverseTotalViewMatrix = totalViewMatrix.inverse();
    }

    lookat(position: Vector3, target: Vector3) {
        // set matrices to the thing
        let matrix = Matrix4.newLookAt(position, target, this.worldPlane.khat);
    }

    private updateClick(state: InputState) {
        // todo
    }

    rotateDropoffDelta = Vector2.zero();
    zoomDelta = 0;
    scrollPrev = 0;
    private updateControls(state: InputState) : boolean {

        let hasChanged = false;
        if (!this.canControl) {
            return hasChanged;
        }
        
        if (state.IsKeyPressed("r")) {
            this.speed *= 2;
        }
        if (state.IsKeyPressed("f")) {
            this.speed = Math.max(this.speed * 0.5, 0.1);
        }

        // deal with mouse
        let prevPos = this.mousePos.clone();
        this.mousePos = state.mousePos.clone();
        let delta = prevPos.clone().sub(this.mousePos);

        // this.getMouseWorldRay(state.canvas.width, state.canvas.height);

        // [ rmb ] rotate the camera. we use a dropoff to make it smooth
        let isControlDown = state.IsKeyDown('control');
        let isShiftDown = state.IsKeyDown('shift');
        if (state.mouseRightDown && !isControlDown && !isShiftDown) {
            hasChanged = delta.y != 0 || delta.x != 0;
            this.rotateDropoffDelta.copy(delta);
        }

        if (!this.rotateDropoffDelta.roughlyEquals(Vector2._zero, 0.1)) {
            hasChanged = true;
            this.angleAlpha = GeonMath.clamp(this.angleAlpha + this.rotateDropoffDelta.y * 0.003, 0, Math.PI);
            this.angleBeta += this.rotateDropoffDelta.x * -0.003;
            this.rotateDropoffDelta.scale(0.9)
        }
        
        // apply scroll 
        if (state.mouseScrollDelta != 0) {
            this.zoomDelta += state.mouseScrollDelta * 0.08;
            
        }
        // [ cntrl + rmb ] zoom the camera 
        if (state.mouseRightDown && isControlDown && !isShiftDown) {
            this.zoomDelta -= delta.y * 0.0005;
        }

        if (!GeonMath.isRougly(this.zoomDelta, 0, 0.001)) {
            hasChanged = true;
            this.zoom = Math.min(-0.001, this.zoom * (1 + this.zoomDelta));
            this.zoomDelta *= 0.9;
        }
        this.scrollPrev = state.scrollValue; 

        ////////////////////////////////

        let relativeUnitZ = () => {
            let m = Matrix4.newXRotation(-this.angleAlpha);
            let m2 = Matrix4.newZRotation(-this.angleBeta);
            return m2.multiplyVector(m.multiplyVector(Vector3.unitZ()));
        }

        let relativeTrueUnitY = () => {
            let m = Matrix4.newXRotation(-this.angleAlpha);
            let m2 = Matrix4.newZRotation(-this.angleBeta);
            return m2.multiplyVector(m.multiplyVector(Vector3.unitY()));
        }

        let relativeUnitY = () => {
            // let m = Matrix4.newXRotation(-this.angleAlpha);
            let m = Matrix4.newZRotation(-this.angleBeta);
            return m.multiplyVector(Vector3.unitY());
        }

        let relativeUnitX = () => {
            let m = Matrix4.newZRotation(-this.angleBeta);
            return m.multiplyVector(Vector3.unitX());
        }

        if (!this.canMove) {
            return hasChanged;
        }

        if (state.IsKeyDown("s")) {
            hasChanged = true;
            this.pos.add(relativeUnitY().scale(0.01 * this.speed));
        }
        if (state.IsKeyDown("w")) {
            hasChanged = true;
            this.pos.add(relativeUnitY().scale(-0.01 * this.speed));
        }
        if (state.IsKeyDown("a")) {
            hasChanged = true;
            this.pos.add(relativeUnitX().scale(0.01 * this.speed));
        }
        if (state.IsKeyDown("d")) {
            hasChanged = true;
            this.pos.add(relativeUnitX().scale(-0.01 * this.speed));
        }
        if (state.IsKeyDown("q")) {
            hasChanged = true;
            this.pos.z += 0.01 * this.speed;
        }
        if (state.IsKeyDown("e")) {
            hasChanged = true;
            this.pos.z -= 0.01 * this.speed;
        }

        // panning
        if (state.mouseRightDown && !isControlDown && isShiftDown) {
            
            hasChanged = true;
            this.pos.add(relativeUnitX().scale(0.0005 * this.zoom * delta.x));
            this.pos.add(relativeTrueUnitY().scale(0.0005 * this.zoom * -delta.y));
        }

        if (isShiftDown && !isControlDown) {
            state.setCursorStyle('move');
        } else if (!isShiftDown && isControlDown) {
            if (delta.y > 0) {
                state.setCursorStyle('zoom-out');
            } else {
                state.setCursorStyle('zoom-in');
            }
        } else if (state.mouseRightDown) {
            state.setCursorStyle('crosshair');
        } else {
            state.setCursorStyle('default');
        }

        return hasChanged;
    }

    

    getCameraPoint(): Vector3 {
        return this.inverseWorldMatrix.multiplyVector(new Vector3(0, 0, 0));
    }

    getMouseWorldRay(canvasWidth: number, canvasHeight: number, useMouse = true): Ray {
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

        let size = 0.5; // size indicator of the fustrum
        let mp = this.mousePos;
        let aspect = canvasWidth / canvasHeight;
        let mouseUnitX = (-size + mp.x / canvasWidth) * aspect;
        let mouseUnitY = -size + mp.y / canvasHeight;

        let f = size / Math.tan(this.fov / 2); // focal length

        let invWorld = this.inverseWorldMatrix;
        let origin = invWorld.multiplyVector(new Vector3(0, 0, 0));

        // TODO instead of doing this, just extract the x, y, and z columns of invWorld
        let iDestiny = invWorld.multiplyVector(new Vector3(1, 0, 0));
        let jDestiny = invWorld.multiplyVector(new Vector3(0, 1, 0));
        let kDestiny = invWorld.multiplyVector(new Vector3(0, 0, -1));

        let ihat = iDestiny.sub(origin).normalize();
        let jhat = jDestiny.sub(origin).normalize();
        let khat = kDestiny.sub(origin).normalize();

        // pardon this insanely ugly statement
        let screenPoint = useMouse
            ? origin
                  .added(khat.scaled(f))
                  .add(ihat.scaled(mouseUnitX))
                  .add(jhat.scaled(-mouseUnitY))
            : origin.added(khat.scaled(f));

        return Ray.fromPoints(origin, screenPoint);
    }

    getProjectionMatrix(canvas: HTMLCanvasElement): Matrix4 {
        // aspects
        let aspect = canvas.width / canvas.height; // note: this should be constant

        // let z_plane = -1. / Math.tan(pi / 8.);

        // projection to screen
        // let projection = Matrix4.newOrthographic(-1, 1, -1, 1, 0.1, 0.1);
        let projection = Matrix4.newPerspective(this.fov, aspect, this.zNear, this.zFar);
        return projection;
    }
}
