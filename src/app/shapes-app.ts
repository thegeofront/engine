// name:    shapes-app.ts
// author:  Jos Feenstra
// purpose: test creation of basic mesh shapes. Test UI

import { PureMesh } from "../mesh/pure-mesh";
import { RenderMesh, meshFromObj } from "../mesh/render-mesh";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Domain3 } from "../math/domain";
import { Vector2, Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "./app";
import { DrawSpeed } from "../render/renderer";
import { Vector3Array } from "../data/vector-array";
import { LineArray } from "../mesh/line-array";
import { FloatMatrix } from "../data/float-matrix";
import { Stat } from "../math/statistics";
import { Plane } from "../geo/plane";
import { Cube } from "../geo/cube";
import { MeshRenderer } from "../render/mesh-renderer";
import { Matrix4 } from "../math/matrix";
import { Circle3 } from "../geo/circle3";
import { IntMatrix } from "../data/int-matrix";
import { IntCube } from "../data/int-cube";
import { Ray } from "../math/ray";
import { Perlin } from "../algorithms/perlin-noise";
import { LineRenderer } from "../render/line-renderer";
import { Core } from "../core";
import { SliderParameter, UI } from "../system/ui";

export class ShapesApp extends App {

    // renderinfo
    camera: Camera;
    dotRenderer: DotRenderer3;
    lineRenderer: SimpleLineRenderer;
    meshRenderer: MeshRenderer;

    // geo data
    plane: Plane = Plane.WorldXY();
    grid?: LineArray;
    geo: RenderMesh[] = [];

    // logic data 
    distance = new SliderParameter("distance", 3.0, 0, 4.0, 0.01);
    size = 10;
    cellSize = 0.5;
    radius = new SliderParameter("radius", 1.0, 0, 4.0, 0.01);
    detail = new SliderParameter("detail", 5.0, 0, );

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        // setup render env
        super(gl);

        // TODO abstract this to scene
        this.camera = new Camera(canvas);
        this.camera.z_offset = -10;
        this.camera.angleAlpha = 0.4;
        this.camera.angleBeta = 0.5;
        
        this.dotRenderer = new DotRenderer3(gl, 4, [0,1,0,1]);
        this.meshRenderer = new MeshRenderer(gl, [0,0,1,1], [1,1,0.5,0]);
        this.lineRenderer = new SimpleLineRenderer(gl);
    }


    ui(ui: UI) {

        // TODO : think of a system that ties parameter & slider together fully
        
        ui.addSlider(this.radius, (value) => {
            this.start();
        });

        ui.addSlider(this.distance, (value) => {
            this.start();
        });
    }


    start() {
        
        let grid = LineArray.fromGrid(this.plane, this.size, this.cellSize);
        let spherePerRing = this.detail.get() * 2;
        let mesh = PureMesh.fromJoin([
            PureMesh.fromSphere(new Vector3(this.distance.get(),0,0), this.radius.get(), this.detail.get(), spherePerRing),
            PureMesh.fromCube(new Cube(this.plane, Domain3.fromRadius(this.radius.get()))),
            PureMesh.fromCone(new Vector3(-this.distance.get(),0,-this.radius.get()), this.radius.get(), this.radius.get() * 2, spherePerRing),
        ]);
        // let mesh = Mesh.fromCube(new Cube(this.plane, Domain3.fromRadius(1)));

        // console.log(mesh.verts);
        // console.log(mesh.links);

        // TODO abstract this to scene 
        this.meshRenderer.set(this.gl, mesh.toDisplayMesh());
        // this.lineRenderer.set(this.gl, grid);
        this.dotRenderer.set(mesh.verts, DrawSpeed.StaticDraw);
    }


    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
        
    }
    

    draw(gl: WebGLRenderingContext) {
        // TODO abstract this to 'scene'
        let matrix = this.camera.getTotalMatrix();

        this.dotRenderer.render(gl, matrix);
        this.meshRenderer.render(gl, matrix);
        // this.lineRenderer.render(gl, matrix);
    }
}
