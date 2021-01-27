// name:    debug-app
// author:  Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { version_converter } from "@tensorflow/tfjs";
import { Mesh, meshFromObj } from "../geo/mesh";
import { GeonImage } from "../img/Image";
import { BellusScanData } from "./bellus-data";
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
import { Rectangle2 } from "../geo/rectangle";

const settings = require('../sfered/settings.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

// note : sadly, this doesnt quite work. 
// TODO : figure out some serialize sceme, aka: spitting out obj data in json format. 

// const DEBUG_LANDMARKS: any = require('../../data/scan/facelandmarks.json'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_JPG: any = require('../../data/scan/head3d.jpg'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_OBJ: any = require('../../data/scan/head3d.obj'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 
// const DEBUG_FRONT_IMAGE: any = require('../../data/scan/image.obj'); // note DIFFERENCE BETWEEN "" AND ''. '' WORKS, "" NOT. 

// console.log(DEBUG_JPG);


export class EyeFinderApp extends App {
    
    // context
    gl: WebGLRenderingContext;
    
    // data 
    bsd?: BellusScanData;

    // process
    eyefinder: EyeFinder;

    // debug data 
    dots2: Vector2[] = [];
    whiteDots: Vector3[] = [];
    redDots: Vector3[] = [];
    images: GeonImage[] = [];
    meshLineIds?: Uint16Array;
    lines: Vector3[] = [];

    // rendering 
    blueDotRenderer: DotRenderer3;
    redDotRenderer: DotRenderer3;
    whiteDotRenderer: DotRenderer3;

    whiteLineRenderer: SimpleLineRenderer;
    redLineRenderer: SimpleLineRenderer;
    blueLineRenderer: SimpleLineRenderer;

    meshRenderer: SimpleMeshRenderer;

    camera: Camera;
    imageRenderer: ImageRenderer;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, context: HTMLDivElement) {
        
        super();

        this.eyefinder = new EyeFinder(this);

        // setup render stuff 
        this.gl = gl; // this is bad practice, but i need it during procesFiles
        this.blueDotRenderer = new DotRenderer3(gl, 6, [0,0,1,1], false);
        this.redDotRenderer = new DotRenderer3(gl, 4, [1,0,0,1], false);
        this.whiteDotRenderer = new DotRenderer3(gl, 5, [0.8,0.8,0.8,1], false);

        this.whiteLineRenderer = new SimpleLineRenderer(gl, [0.9,0.9,0.9,0.9]);
        this.blueLineRenderer = new SimpleLineRenderer(gl, [0,0,1,0.5]);
        this.redLineRenderer = new SimpleLineRenderer(gl, [1,0,0,0.5]);
        
        this.meshRenderer = new SimpleMeshRenderer(gl, [0,0,1,0.25]);
        this.imageRenderer = new ImageRenderer(gl);
        this.camera = new Camera(canvas, 0.1);

        addDropFileEventListeners(canvas, processFiles.bind(this));
    }

    start() {
        // nothing
    }

    update(state: InputState) {
        
        // move the camera with the mouse
        this.camera.updateWithControls(state); 
    }

    draw(gl: WebGLRenderingContext) {

        // get to-screen matrix
        const canvas = gl.canvas as HTMLCanvasElement;
        let matrix = this.camera.getRenderToScreenMatrix(canvas);

     
        if (this.bsd?.mesh == undefined)
            this.redDotRenderer.render(gl, matrix, Vector3Array.fromNativeArray([new Vector3(0,0,0), new Vector3(1,1,1)]));
        else {
            let mesh = this.bsd?.mesh;
            let landmarks = this.bsd?.landmarks;

            //this.redLineRenderer.render(gl, matrix);
            // this.dotRenderer.renderQuick(gl, matrix, landmarks3.data, 3);
            // this.dotRenderer.renderQuick(gl, matrix, mesh.verts.data, 3);
            // 
            // this.redLineRenderer.render(gl, matrix);
            // console.log(this.dots2);

            // show the mesh
            this.blueLineRenderer.setAndRender(gl, matrix, mesh.verts, this.meshLineIds!)
            this.blueLineRenderer.setAndRender(gl, matrix, mesh.uvs, this.meshLineIds!)
            this.redDotRenderer.render(gl, matrix, landmarks);
            this.blueDotRenderer.render(gl, matrix, mesh.uvs);
            this.blueDotRenderer.render(gl, matrix, mesh.uvs);

            // debug data from eyefinder process
            this.redDotRenderer.render(gl, matrix, this.dots2);
            this.whiteDotRenderer.render(gl, matrix, this.whiteDots);
            this.redDotRenderer.render(gl, matrix, this.redDots);
            this.whiteLineRenderer.setAndRenderLines(gl, matrix, this.lines);

            // render images
            let height = 200;
            let width = 300;
            this.images.forEach((image, i) => {
                this.imageRenderer.render(gl, 
                    new Rectangle2(Matrix3.newIdentity(), Domain2.fromBounds(10,10+width, i*(height+10), i*(height+10) + height)), 
                    image.toImageData());
            });
        }    
    }

    addBellusData(bsd: BellusScanData) {

        this.bsd = bsd;
        
        // start the eyefinder
        this.eyefinder.findPupilsFromBellus(bsd);

        // put the data into the render buffers.
        let mesh = this.bsd?.mesh;

        // this.meshRenderer.set(this.gl, mesh.verts, mesh.faces);
        this.meshLineIds = mesh.getLineIds();
        // this.lineRenderer.set(this.gl, mesh.verts.data, mesh.getLineIds(), 3);
        // this.redLineRenderer.set(this.gl, mesh.uvs.data, mesh.getLineIds(), 2);
    }
}

async function processFiles(this: EyeFinderApp, files: FileList) {

    BellusScanData.fromFileList(files, settings).then(
        (bsd) => this.addBellusData(bsd)
    );
}