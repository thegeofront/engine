// name:    obj-loader-app.ts
// author:  Jos Feenstra
// purpose: test statistic functionalties

// TODO: MAKE IT 3D
// - 3D matrix (sounds stupid i know)
// - improve visuals slightly (no surface between cubes)
// - place at normal 
// - block ray cast-> pick first

// TODO: MARCHING WAVE FUNCTION COLLAPSE 
// - how to make interesting prototypes, but still use a bitmap data model?

import { Mesh, meshFromObj } from "../geo/mesh";
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
import { LineArray } from "../data/line-array";
import { FloatMatrix } from "../data/float-matrix";
import { Stat } from "../math/statistics";
import { Plane } from "../geo/plane";
import { Cube } from "../geo/cube";
import { MeshRenderer } from "../render/mesh-renderer";
import { Matrix4 } from "../math/matrix";
import { Circle3 } from "../geo/circle3";
import { IntMatrix } from "../data/int-matrix";

export class GeometryApp extends App {

    // renderinfo
    dotRenderer: DotRenderer3;
    whiteLineRenderer: SimpleLineRenderer;
    greyLineRenderer: SimpleLineRenderer;
    redLineRenderer: SimpleLineRenderer;
    meshRenderer: MeshRenderer;
    transMeshRenderer: MeshRenderer;
    camera: Camera;

    // geo data
    plane: Plane = Plane.WorldXY();
    gridLarge!: LineArray;
    gridSmall!: LineArray;
    dots: Vector3[] = [];
    geo: Mesh[] = [];
    mapGeo: Mesh[] = [];
    cursorVisual?: LineArray

    // logic data 
    size = 100;
    cellSize = 1;
    map!: IntMatrix;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        // setup render env
        super(gl);
        this.camera = new Camera(canvas);
        this.dotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.whiteLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,1]);
        this.greyLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [0.8,0,0,1]);
        this.meshRenderer = new MeshRenderer(gl);
        this.transMeshRenderer = new MeshRenderer(gl, [1,1,1,0.10], [1,1,1,0.10]);
    }


    // called after init
    start() {

        this.map = new IntMatrix(this.size, this.size);
        this.map.fill(0);
        // for(let i = 0 ; i < this.size; i++) {
        //     this.map.set(50, i, 1);
        // }
        
        // after change, buffer 
        this.buffer();

        this.gridLarge = LineArray.fromGrid(this.plane, this.size, this.cellSize);
        this.gridSmall = LineArray.fromGrid(this.plane, (this.size*10)-1, this.cellSize / 10);

        this.whiteLineRenderer.set(this.gl, this.gridLarge, DrawSpeed.StaticDraw);
        this.greyLineRenderer.set(this.gl, this.gridSmall, DrawSpeed.StaticDraw);
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 

        this.updateCursor(state);
    }

    updateCursor(state: InputState) {
        
        // render mouse to world line 
        let mouseRay = this.camera.getMouseWorldRay(state.canvas.width, state.canvas.height);
        let cursor = mouseRay.at(mouseRay.xPlane(this.plane));
        let plane = this.plane.clone();
        plane.matrix = plane.matrix.multiply(Matrix4.newTranslation(cursor.x, cursor.y, cursor.z));
        this.cursorVisual = LineArray.fromCircle(new Circle3(plane, 0.1));
        
        // render cube at this position
        let mapCursor = this.worldToMap(cursor);
        let coord = this.mapToWorld(mapCursor);
        let cube = this.createCube(coord);
        this.geo = []
        this.geo.push(Mesh.fromCube(cube));  
        
        // click
        if (state.mouseLeftDown) {
            if (state.IsKeyDown(" ")) {
                if (this.map.get(mapCursor.x, mapCursor.y) == 0) 
                    return;
                this.map.set(mapCursor.x, mapCursor.y, 0);
                this.buffer();
            } else if (this.map.get(mapCursor.x, mapCursor.y) != 1) {
                this.map.set(mapCursor.x, mapCursor.y, 1);
                this.buffer();
            } 
        }
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getTotalMatrix();

        // render the grid
        this.greyLineRenderer.render(gl, matrix);
        this.whiteLineRenderer.render(gl, matrix);

        this.redLineRenderer.setAndRender(gl, matrix, this.cursorVisual!);

        // render the map
        // TODO create MeshArray
        this.meshRenderer.render(gl, matrix);

        // render other things
        for (let geo of this.geo) {
            this.transMeshRenderer.setAndRender(gl, matrix, geo);
        }
    }


    // flush this.mapGeo
    // turn this.map into this.mapGeo
    buffer() {
        let mapGeo = []
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let entry = this.map.get(i, j);
                if (entry == 1) {
                    console.log("poep")
                    let coord = this.mapToWorld(new Vector2(i, j));
                    let cube = this.createCube(coord);
                    mapGeo.push(Mesh.fromCube(cube));
                }
            }
        }
        this.meshRenderer.set(this.gl, Mesh.fromJoin(mapGeo));
    }

    
    worldToMap(coord: Vector3) : Vector2 {
        let halfsize = (this.size / 2) + (this.cellSize / 2);
        return coord.clone().to2D().add(new Vector2(halfsize, halfsize)).floor();
    }


    mapToWorld(point: Vector2) : Vector3 {
        let halfsize = this.size / 2;
        return point.clone().add(new Vector2(-halfsize, -halfsize)).to3D();
    }


    createCube(center: Vector3) {
        let hs = this.cellSize / 2;
        let move = Matrix4.newTranslation(center.x, center.y, center.z);
        let cube = new Cube(Plane.WorldXY().transform(move), Domain3.fromBounds(-hs, hs, -hs, hs, 0, this.cellSize));
        return cube;
    }
}
