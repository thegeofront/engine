// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

import { Mesh, meshFromObj } from "../geo/mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Domain3 } from "../math/domain";
import { Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";
import { DrawSpeed } from "../render/renderer";
import { Vector3Array } from "../data/vector-array";
import { LineArray } from "../data/line-array";
import { FloatMatrix } from "../data/float-matrix";
import { Stat } from "../math/statistics";
import { Plane } from "../geo/plane";
import { Cube } from "../geo/cube";
import { MeshRenderer } from "../render/mesh-renderer";
import { Matrix4 } from "../math/matrix";
import { Circle3 } from "../geo/circle3";

export class GeometryApp extends App {

    // renderinfo
    dotRenderer: DotRenderer3;
    whiteLineRenderer: SimpleLineRenderer;
    greyLineRenderer: SimpleLineRenderer;
    redLineRenderer: SimpleLineRenderer;
    meshRenderer: MeshRenderer;
    camera: Camera;

    // data 
    plane: Plane = Plane.WorldXY();
    gridLarge!: LineArray;
    gridSmall!: LineArray;
    geo: Mesh[] = [];
    dots: Vector3[] = [];
    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        super(gl);
        this.dotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.whiteLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,1]);
        this.greyLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [0.8,0,0,1]);
        this.meshRenderer = new MeshRenderer(gl, [1,0,0,0.25]);
        this.camera = new Camera(canvas);
    }

    start() {
        let size = 100;
        this.gridLarge = LineArray.fromGrid(this.plane, size, 1);
        this.gridSmall = LineArray.fromGrid(this.plane, (size*10)-1, 0.1);

        this.whiteLineRenderer.set(this.gl, this.gridLarge, DrawSpeed.StaticDraw);
        this.greyLineRenderer.set(this.gl, this.gridSmall, DrawSpeed.StaticDraw);

        let cube = new Cube(Plane.WorldXZ(), Domain3.fromBounds(-0.5, 0.5, -0.5,0.5, 0,1));
        this.geo.push(Mesh.fromCube(cube));
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getTotalMatrix();

        // render the grid
        this.greyLineRenderer.render(gl, matrix);
        this.whiteLineRenderer.render(gl, matrix);

        // render mouse to world line 
        // let mouseWorldLine = this.camera.getMouseWorldRay();
        if (this.camera.mouseRayVisual) 
            this.redLineRenderer.setAndRender(gl, matrix, this.camera.mouseRayVisual);

        if (this.camera.mouseRay) {
            let ray = this.camera.mouseRay;
            let cursor = ray.at(ray.xPlane(this.plane));
            // this.dotRenderer.render(gl, matrix, [cursor]);
            this.dotRenderer.render(gl, matrix, [
                ray.at(-1), ray.at(-2), ray.at(-3), ray.at(-4), ray.at(-5)
            ]);
            console.log(ray.at(1), ray.at(2), ray.at(3), ray.at(4), ray.at(5))
            let plane = Plane.WorldXY()
            plane.matrix = plane.matrix.multiply(Matrix4.newTranslation(cursor.x, cursor.y, cursor.z));
            this.redLineRenderer.setAndRender(gl, matrix, 
                LineArray.fromCircle(new Circle3(plane, 0.1)));
        }

        // render the boxes
        for(let geo of this.geo) {
            this.meshRenderer.setAndRender(gl, matrix, geo);
        }

        // render some debug points
        let vec = this.camera.getCameraPoint();
        // console.log(vec.clone().scale(-1));
        
        // this is the location of the camera
        // console.log(vec);
        // console.log(this.camera.pos);
        // vec.y = 0;
        vec.z = 0;
        this.dotRenderer.render(gl, matrix, [this.camera.pos, vec]);
    }
}
