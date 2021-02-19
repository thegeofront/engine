// name:    debug-app
// author:  Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { version_converter } from "@tensorflow/tfjs";
import { Mesh, meshFromObj } from "../geo/mesh";
import { GeonImage } from "../img/Image";
import { BellusScanData, NextcloudScanData } from "./scan-data";
import { addDropFileEventListeners, loadTextFromFile } from "../system/domwrappers";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Domain, Domain2, Domain3 } from "../math/domain";
import { Vector2, Vector3 } from "../math/vector";
import { Camera } from "../render/camera";
import { DotRenderer3 } from "../render/dot-renderer3";
import { SimpleLineRenderer } from "../render/simple-line-renderer";
import { SimpleMeshRenderer } from "../render/simple-mesh-renderer";
import { InputState } from "../system/input-state";
import { App } from "../app/app";
import { EyeFinder } from "./eye-finder";
import { Matrix3, Matrix4 } from "../math/matrix";
import { ImageRenderer } from "../render/image-renderer";
import { Rectangle2 } from "../geo/rectangle2";
import { LineArray } from "../data/line-array";
import { Circle3 } from "../geo/circle3";
import { Plane } from "../geo/plane";
import { TextureMeshRenderer } from "../render/texture-mesh-renderer";
import { DrawSpeed } from "../render/renderer";

const settings = require('../sfered/settings.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

// note : sadly, this doesnt quite work. 
// TODO : figure out some serialize sceme, aka: spitting out obj data in json format. 

// const DEBUG_LANDMARKS: any = require('../../data/scan/facelandmarks.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_JPG: any = require('../../data/scan/head3d.jpg'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_OBJ: any = require('../../data/scan/head3d.obj'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_FRONT_IMAGE: any = require('../../data/scan/image.obj'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

// console.log(DEBUG_JPG);


export class EyeFinderApp extends App {

    // data 
    mesh?: Mesh;
    landmarks?: Vector3Array;

    // process
    eyefinder: EyeFinder;

    // debug data 
    dots?: Vector3Array;
    dots2: Vector2[] = [];
    whiteDots: Vector3[] = [];
    redDots: Vector3[] = [];
    images: GeonImage[] = [];
    meshLineIds?: Uint16Array;
    lines: Vector3[] = [];
    lineRenderables: LineArray[] = [];

    // rendering 
    blueDotRenderer: DotRenderer3;
    redDotRenderer: DotRenderer3;
    whiteDotRenderer: DotRenderer3;

    whiteLineRenderer: SimpleLineRenderer;
    redLineRenderer: SimpleLineRenderer;
    blueLineRenderer: SimpleLineRenderer;

    meshRenderer: TextureMeshRenderer;

    camera: Camera;
    imageRenderer: ImageRenderer;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, context: HTMLDivElement) {
        
        super(gl);

        this.eyefinder = new EyeFinder(this);

        // setup render stuff 
        this.blueDotRenderer = new DotRenderer3(gl, 6, [0,0,1,1], false);
        this.redDotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.whiteDotRenderer = new DotRenderer3(gl, 5, [0.8,0.8,0.8,1], false);

        this.whiteLineRenderer = new SimpleLineRenderer(gl, [0.9,0.9,0.9,0.9]);
        this.blueLineRenderer = new SimpleLineRenderer(gl, [0,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [1,0,0,0.5]);
        
        this.meshRenderer = new TextureMeshRenderer(gl);
        this.imageRenderer = new ImageRenderer(gl);
        this.camera = new Camera(canvas, 0.1);

        addDropFileEventListeners(canvas, processFiles.bind(this));
    }

    start() {
        // nothing
        console.log("hoi");
        let lines = LineArray.fromCircle(new Circle3(Plane.WorldXY(), 0.5));
        this.lineRenderables.push(lines);
        console.log(lines);
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.update(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getTotalMatrix();

        this.lineRenderables.forEach((renderable) => {
            this.redLineRenderer.setAndRender(gl, matrix, renderable);
        })
     
        if (this.mesh == undefined)
            this.redDotRenderer.render(gl, matrix, Vector3Array.fromList([new Vector3(0,0,0), new Vector3(1,1,1)]));
        else {
            let mesh = this.mesh;
            let landmarks = this.landmarks;

            
    
            // show the mesh
            this.meshRenderer.render(gl, matrix);
            this.blueLineRenderer.render(gl, matrix);
            // this.blueLineRenderer.setAndRender(gl, matrix, LineArray.fromMesh(mesh, false))
            if (landmarks)
                this.redDotRenderer.render(gl, matrix, landmarks);
            this.blueDotRenderer.render(gl, matrix, mesh.uvs);   

            // debug data from eyefinder process
            this.redDotRenderer.render(gl, matrix, this.dots2);
            this.whiteDotRenderer.render(gl, matrix, this.whiteDots);
            this.redDotRenderer.render(gl, matrix, this.redDots);
            this.whiteLineRenderer.setAndRender(gl, matrix, LineArray.fromLines(this.lines));

            this.redLineRenderer.render(gl, matrix);

            // render images
            let height = 200;
            let width = 300;
            // this.images.forEach((image, i) => {
            //     this.imageRenderer.setAndRender(gl, 
            //         new Rectangle2(Matrix3.newIdentity(), Domain2.fromBounds(10,10+width, i*(height+10), i*(height+10) + height)), 
            //         image.toImageData());
            // });

            // render some dots 
            if (this.dots) {
                //
                this.redDotRenderer.render(gl, matrix, this.dots);
            }
        }    
    }

    addNextcloudData(data: NextcloudScanData) {

        // start the eyefinder
        let [left, right] = this.eyefinder.findPupilsFromNextcloud(data);

        // console.log(left);
        // console.log(right);

        let mesh = data.mesh;        
        // this.meshRenderer.set(this.gl, mesh);
        this.blueLineRenderer.set(this.gl, LineArray.fromMesh(mesh), DrawSpeed.StaticDraw);
        this.mesh = mesh;

        console.log(data.eyePointsEdited);
        this.dots = data.eyePointsEdited;
        this.dots.forEach((v, n) => {
            console.log(v);
        });
        
    }

    addBellusData(bsd: BellusScanData) {

        // start the eyefinder
        let [left, right] = this.eyefinder.findPupilsFromBellus(bsd);

        this.camera.pos = left.clone();
        // this.camera.offset.x = 100;

        // put the data into the render buffers.
        let mesh = bsd.mesh;

        this.meshRenderer.set(this.gl, mesh);
        this.blueLineRenderer.set(this.gl, LineArray.fromMesh(mesh), DrawSpeed.StaticDraw);
        // this.redLineRenderer.set(this.gl, mesh.uvs.data, mesh.getLineIds(), 2);

        this.mesh = bsd.mesh;
        this.landmarks = bsd.landmarks;
    }
}

enum Format {
    None,
    Bellus, // the special dataset gathered at an earlier step
    NextCloudDataset // the 140 or so scans on nextcloud 
}

function getFormat(files: FileList) : Format {

    for(let i = 0 ; i < files.length; i++) {
        let file = files.item(i)!;
        if (file.name == "facelandmarks.json") {
            return Format.Bellus;
        }
        if (file.name == "scaninfo.txt") {
            return Format.NextCloudDataset;
        }
    }
    return Format.None;
}

async function processFiles(this: EyeFinderApp, files: FileList) {

    let format = getFormat(files);
    switch(format) {
        case Format.Bellus: 
            console.log("found a bellus-style dataset! processing...")
            BellusScanData.fromFileList(files, settings).then(
                (bsd) => this.addBellusData(bsd)
            );
            break;
        case Format.NextCloudDataset: 
            console.log("found a scan from the nextcloud format! processing...")
            NextcloudScanData.fromFileList(files, settings).then(
                (data) => this.addNextcloudData(data)
            );
            break;
        case Format.None: 
            console.log("couldnt read the files you gave me...")
            break;
    }


}