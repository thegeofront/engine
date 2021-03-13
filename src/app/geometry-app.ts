// name:    geometry-app.ts
// author:  Jos Feenstra
// purpose: a 3d voxel environment to toy around in. Uses several features of geon

import { PureMesh } from "../mesh/pure-mesh";
import { RenderMesh, meshFromObj,} from "../mesh/render-mesh"
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
import { IntCube } from "../data/int-cube";
import { Ray } from "../math/ray";
import { Perlin } from "../algorithms/perlin-noise";

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
    geo: RenderMesh[] = [];
    mapGeo: RenderMesh[] = [];
    cursorVisual?: LineArray

    // logic data 
    size = 50;
    cellSize = 1;
    map!: IntCube;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
        
        // setup render env
        super(gl);
        this.camera = new Camera(canvas, 10, true);
        this.dotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.whiteLineRenderer = new SimpleLineRenderer(gl, [1,1,1,1]);
        this.greyLineRenderer = new SimpleLineRenderer(gl, [0.2,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [0.8,0,0,1]);
        this.meshRenderer = new MeshRenderer(gl);
        this.transMeshRenderer = new MeshRenderer(gl, [1,1,1,0.10], [1,1,1,0.10]);
    }


    // called after init
    start() {

        this.map = new IntCube(this.size, this.size, this.size);
        this.map.fill(0);

        // add random blocks in the world
        this.map.map((value, index) => {
            if (Math.random() > 0.99) {
                return 1;
            } else {
                return value;
            }
        })
        
        // let perlin = new Perlin();
        // this.map.map((value, i) => {

        //     let c = this.map.getCoords(i);
            
        //     let scale = 0.05;
        //     let noise = perlin.noise(c.x * scale, c.y * scale, c.z * scale);

        //     if (i < 10) {
        //         console.log(c);
        //         console.log(noise);
        //     }
            

        //     if (noise > 0.60) {
        //         return 1;
        //     } else {
        //         return value;
        //     }
        // })

        
        // console.log("done setting")


        // after change, buffer 
        this.bufferMap();

        // console.log("done")

        this.gridLarge = LineArray.fromGrid(this.plane, this.size, this.cellSize);
        this.gridSmall = LineArray.fromGrid(this.plane, (this.size*10)-1, this.cellSize / 10);

        // this.whiteLineRenderer.set(this.gl, this.gridLarge, DrawSpeed.StaticDraw);
        // this.greyLineRenderer.set(this.gl, this.gridSmall, DrawSpeed.StaticDraw);
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 

        this.updateCursor(state);
    }
    

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getTotalMatrix();

        // render the grid
        // this.greyLineRenderer.render(gl, matrix);
        // this.whiteLineRenderer.render(gl, matrix);

        // this.redLineRenderer.setAndRender(gl, matrix, this.cursorVisual!);

        // render the map
        // TODO create MeshArray
        this.meshRenderer.render(gl, matrix);

        // render other things
        for (let geo of this.geo) {
            this.transMeshRenderer.setAndRender(gl, matrix, geo);
        }
    }

    addPreviewCube(point: Vector3) {
        let cubeCenter = this.mapToWorld(point);
        let cube = this.createCube(cubeCenter);
        this.geo.push(PureMesh.fromCube(cube).toDisplayMesh());
    }

    flushPreviewCubes() {
        this.geo = [];
    }

    updateCursor(state: InputState) {
        
        // render mouse to world line 
        let mouseRay = this.camera.getMouseWorldRay(state.canvas.width, state.canvas.height);
        
        // snap to world
        // let cursor = mouseRay.at(mouseRay.xPlane(this.plane));
        // let mapCursor = this.worldToMap(cursor);
        // let coord = this.mapToWorld(mapCursor);

        // place circle at cursor
        // let plane = this.plane.clone();
        // plane.matrix = plane.matrix.multiply(Matrix4.newTranslation(cursor.x, cursor.y, cursor.z));
        // this.cursorVisual = LineArray.fromCircle(new Circle3(plane, 0.1));
        
        // figure out which cube we are pointing to
        this.flushPreviewCubes();
        let [cubeID, cubeIDprevious] = this.voxelRaycast(mouseRay, 40);
        if (cubeID == -1) {
            // nothing else to do
            return;        
        }

        let cubeCursor = this.map.getCoords(cubeIDprevious);   
        this.addPreviewCube(cubeCursor);
        

        // render cube at this position
        
        
        // this.geo.push(Mesh.fromCube(cube));  
        
        // click
        if (state.mouseLeftPressed) {
            console.log("click")
            if (state.IsKeyDown(" ")) {
                if (this.map.data[cubeID] == 0) 
                    return;
                this.map.data[cubeID] = 0;
                this.bufferMap();
            } else if (this.map.data[cubeIDprevious] != 1) {
                this.map.data[cubeIDprevious] = 1;
                this.bufferMap();
            } 
        }
    }

    
    // return the ID of the 
    // A Fast Voxel Traversal Algorithm for Ray Tracing
    // Amanatides, Woo
    // Dept. of Computer Science
    voxelRaycast(ray: Ray, range: number) : [number, number] {

        let startPoint = this.worldToMap(ray.origin);
        let voxelCenter = this.mapToWorld(startPoint);

        // integers
        let x = startPoint.x;
        let y = startPoint.y;
        let z = startPoint.z;

        let xprev = x;
        let yprev = y;
        let zprev = z;

        let stepX = ray.normal.x > 0 ? 1 : -1;
        let stepY = ray.normal.y > 0 ? 1 : -1;
        let stepZ = ray.normal.z > 0 ? 1 : -1;

        // floats
        let voxelsize = this.cellSize;
        let deltax = voxelsize / Math.abs(ray.normal.x);
        let deltay = voxelsize / Math.abs(ray.normal.y);
        let deltaz = voxelsize / Math.abs(ray.normal.z);

        // intit tx, ty, and tz, at their first intersection with corresponding plane
        voxelCenter.add(new Vector3(voxelsize/2 * stepX, voxelsize/2 * stepY, voxelsize/2 * stepZ));

        let move = Matrix4.newTranslation(voxelCenter.x, voxelCenter.y, voxelCenter.z);
        let xy = Plane.WorldXY();
        xy._matrix.multiply(move);
        let yz = Plane.WorldYZ();
        yz._matrix.multiply(move);
        let xz = Plane.WorldXZ();
        xz._matrix.multiply(move);

        let tx = ray.xPlane(yz);
        let ty = ray.xPlane(xz);
        let tz = ray.xPlane(xy);

        if (tx < 0 || ty < 0 || tz < 0) {
            console.log("something critical went wrong!");
            return [-1, -1];
        }

        // debug ray
        // let lineSets: LineArray[] = [ray.toLine(100), LineArray.fromPlane(xy), LineArray.fromPlane(yz), LineArray.fromPlane(xz)];
        // this.whiteLineRenderer.set(this.gl, LineArray.fromJoin(lineSets), DrawSpeed.StaticDraw);

        // console.log("voxel raycast initialized with:");
        // console.log("deltas: ", deltax, deltay, deltaz);
        // console.log("t's: ", tx, ty, tz);

        // start iterating
        // console.log("cast away!");
        // this.addPreviewCube(new Vector3(x,y,z));
        // console.log(x,y,z);
        for(let i = 0 ; i < range; i++) {

            // this.addPreviewCube(new Vector3(xprev,yprev,zprev));

            // if hit, return previous
            let value = this.map.tryGet(x,y,z);
            if (value == 1) {
                // console.log("found a cube after " + i + "steps...");
                // this.addPreviewCube(new Vector3(xprev,yprev,zprev));
                return [this.map.getIndex(x,y,z), this.map.getIndex(xprev, yprev, zprev)];
            } else {
                xprev = x;
                yprev = y;
                zprev = z;
            }

            // to the next cube!
            if (tx < ty && tx < tz) {
                // x 
                tx += deltax;
                x += stepX;
            } else if (ty < tz) {
                // y
                ty += deltay;
                y += stepY;
            } else {
                // z
                tz += deltaz;
                z += stepZ;
            }
        }
        return [-1, -1]
    }

    // flush this.meshRenderer
    // turn this.map into this.mapGeo
    bufferMap() {
        let mapGeo: RenderMesh[] = []
        this.map.iter((entry, index) => {
            if (entry == 1) {
                let mapCoord = this.map.getCoords(index);
                let coord = this.mapToWorld(mapCoord);
                let cube = this.createCube(coord);
                mapGeo.push(PureMesh.fromCube(cube).toDisplayMesh());
            }
        });
        this.meshRenderer.set(this.gl, RenderMesh.fromJoin(mapGeo));
    }

    
    worldToMap(coord: Vector3) : Vector3 {
        let halfsize = (this.size / 2) + (this.cellSize / 2);
        return coord.added(new Vector3(halfsize, halfsize, halfsize)).floored();
    }


    mapToWorld(point: Vector3) : Vector3 {
        let halfsize = this.size / 2;
        return point.added(new Vector3(-halfsize, -halfsize, -halfsize));
    }


    createCube(center: Vector3) {
        let hs = this.cellSize / 2;
        let move = Matrix4.newTranslation(center.x, center.y, center.z);
        let cube = new Cube(Plane.WorldXY().transform(move), Domain3.fromBounds(-hs, hs, -hs, hs,-hs, hs));
        return cube;
    }
}
