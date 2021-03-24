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
import { LineRenderer } from "../render/line-renderer";
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
import { MeshDebugRenderer } from "../render/mesh-debug-renderer";
import { Matrix4 } from "../math/matrix";
import { Circle3 } from "../geo/circle3";
import { IntMatrix } from "../data/int-matrix";
import { IntCube } from "../data/int-cube";
import { Ray } from "../math/ray";
import { Perlin } from "../algorithms/perlin-noise";
import { Core } from "../core";
import { Parameter, UI } from "../system/ui";
import { ShadedMeshRenderer } from "../render/shaded-mesh-renderer";

export class MeshInspectorApp extends App {

    // renderinfo
    camera: Camera;
    dotRenderer: DotRenderer3;
    lineRenderer: LineRenderer;
    meshRenderer: MeshDebugRenderer;
    shadedMeshRenderer: ShadedMeshRenderer;

    // geo data
    plane: Plane = Plane.WorldXY();
    grid?: LineArray;
    geo: RenderMesh[] = [];

    // logic data 
    size = 10;
    cellSize = 0.5;

    distance = new Parameter("distance", 3.0, 0, 4.0, 0.01);
    radius = new Parameter("radius", 1.0, 0, 4.0, 0.01);
    detail = new Parameter("detail", 5, 0, 100, 1);

    renderNormals = new Parameter("render normals", 1, 0, 1, 0); // boolean Param
    shademethod = 0 // TODO enum Param

    constructor(gl: WebGLRenderingContext) {
        
        // setup render env
        super(gl);
        let canvas = gl.canvas as HTMLCanvasElement;

        // TODO abstract this to scene
        this.camera = new Camera(canvas);
        this.camera.z_offset = -10;
        this.camera.angleAlpha = 0.4;
        this.camera.angleBeta = 0.5;
        
        this.dotRenderer = new DotRenderer3(gl, 4, [0,1,0,1]);
        this.meshRenderer = new MeshDebugRenderer(gl, [0.6,0,0,1], [1,0,0,1]);
        this.lineRenderer = new LineRenderer(gl, [0.3,0.3,0.3,1]);
        this.shadedMeshRenderer = new ShadedMeshRenderer(gl);
    }


    ui(ui: UI) {

        // TODO : think of a system that ties parameter & slider together fully
        
        ui.addParameter(this.radius, (value) => {
            this.start();
        });

        ui.addParameter(this.distance, (value) => {
            this.start();
        });

        ui.addParameter(this.detail, (value) => {
            this.start();
        });

        ui.addBooleanParameter(this.renderNormals, (b) => {
            this.start();
        })

        // render methods
        ui.addEnum(["debug", "shaded"], [0,1], (val) => {
            this.shademethod = val;
            this.start();
        });
    }


    start() {
        
        let grid = LineArray.fromGrid(this.plane.clone().moveTo(new Vector3(0,0, -this.radius.get())), 100, 2);
        let spherePerRing = this.detail.get() * 2;

        let rad = this.radius.get();
        let dis = this.distance.get();
        let det = this.detail.get();

        let mesh = PureMesh.fromJoin([
            PureMesh.fromSphere(new Vector3(dis,0,0), this.radius.get(), this.detail.get(), spherePerRing),
            // PureMesh.fromCube(new Cube(this.plane, Domain3.fromRadius(this.radius.get()))),
            PureMesh.fromCone(new Vector3(-dis, 0, -this.radius.get()), this.radius.get(), this.radius.get() * 2, spherePerRing),
            PureMesh.fromCylinder(
                new Vector3(0, 0, -rad), 
                new Vector3(0, 0,  rad),
                rad,
                det),
        ]);
        let dmesh = mesh.toDisplayMesh();

        if (this.renderNormals.get() == 1) {
            dmesh.calculateFaceNormals();
        }

        console.log(new Parameter("shadeMethod",0,0,2,0.5).getNPermutations())

        // let mesh = Mesh.fromCube(new Cube(this.plane, Domain3.fromRadius(1)));

        // console.log(mesh.verts);
        // console.log(mesh.links);

        // TODO abstract this to scene 
        if (this.shademethod == 0) {
            this.meshRenderer.set(this.gl, dmesh);
        } else {
            this.shadedMeshRenderer.set(this.gl, dmesh);
        }
        
        this.lineRenderer.set(this.gl, grid);
        // this.dotRenderer.set(mesh.verts, DrawSpeed.StaticDraw);
    }


    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
        
    }
    

    draw(gl: WebGLRenderingContext) {
        // TODO abstract this to 'scene'
        let matrix = this.camera.totalMatrix;
        this.dotRenderer.render(gl, matrix);


        if (this.shademethod == 0) {
            this.meshRenderer.render(gl, matrix);
        } else if (this.shademethod == 1) {
            this.shadedMeshRenderer.render(gl, this.camera);
        }
        
        this.lineRenderer.render(gl, matrix);
    }
}
