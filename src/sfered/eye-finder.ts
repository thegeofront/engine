// name:    eye-finder.ts
// author:  Jos Feenstra
// purpose: Keeper of the full pupil-point.

import { EyeFinderApp } from "./eye-finder-app";
import { GeonImage } from "../img/Image";
import { Kernels } from "../img/kernels";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Domain2 } from "../math/domain";
import { Vector2, Vector3 } from "../math/vector";
import { DotRenderer3 } from "../render/dot-renderer3";
import { BellusScanData, NextcloudScanData } from "./scan-data";
import { TopoMesh } from "../mesh/topo-mesh";
import { Plane } from "../geo/plane";
import { Matrix4 } from "../math/matrix";
import { RansacCircle2d } from "./ransac";
import { LineArray } from "../mesh/line-array";
import { Circle3 } from "../geo/circle3";



export class EyeFinder {

    app?: EyeFinderApp

    constructor(app?: EyeFinderApp) {
        this.app = app;
    }


    public findPupilsFromNextcloud(data: NextcloudScanData) {

        console.log("finding eyes from nextcloud set...");

        let topo = TopoMesh.copyFromMesh(data.mesh);
        let image = GeonImage.fromImageData(data.texture);
        let [winLeft, winRight] = this.getEyeWindowsNextcloud(data, topo);

        return this.findPupils(image, topo, data.settings, winLeft, winRight);
    }


    public findPupilsFromBellus(bsd: BellusScanData) {

        console.log("finding eyes from bellus...");

        // get the window with which the eyes can be extracted
        let topo = TopoMesh.copyFromMesh(bsd.mesh);
        let image = GeonImage.fromImageData(bsd.texture);
        let [winLeft, winRight] = this.getEyeWindows(bsd);

        return this.findPupils(image, topo, bsd.settings, winLeft, winRight);
    }

    // some stupid wrapping
    public findPupils(image: GeonImage, topo: TopoMesh, settings: any, winLeft: Domain2, winRight: Domain2) {
        
        // left side
        let ransacSettings = settings.process_ransac;
        let leftPupilPoint = this.findPupilFromEye(image, topo, winLeft, ransacSettings);

        // right side
        let rightPupilPoint = this.findPupilFromEye(image, topo, winRight, ransacSettings);

        if (leftPupilPoint && rightPupilPoint) {
            return [leftPupilPoint, rightPupilPoint] 
        } else {
            return;
        }
    }


    private findPupilFromEye(image: GeonImage, mesh: TopoMesh,  window: Domain2, ransacSettings: any) : Vector3 | undefined {

        // step 1: get points (vectors) which symbolize pixels in contrasting areas of the image (the iris).
        let eyeImg = image.trimWithDomain(window);
        let contrastEyeImg = this.contrastDetection(eyeImg);
        let cps = this.pixelsToPoints(contrastEyeImg, 50);
        
        if (cps.count() < 0) {
            return;
        }
        let scaleVec = new Vector2(1 / image.width, 1 / image.height);

        // convert these points to the same space as the uv points of the mesh
        cps.forEach((p) => {
           
            // move from eyetrim to original image space
            p.add(new Vector2(window.x.t0, window.y.t0));

            // move from pixel space to normalized uv space
            p.mul(scaleVec);

            // flip and move according to uv parameters
            p.mul(new Vector2(1, -1));
            p.add(new Vector2(0, 1));
        });


        // step 2: elevate from uv space to vertex space of the mesh
        let cpsElevated = cps.to3D().map((p, i) => {
            return mesh.elevate(p.to2D());
        }) 
        this.app?.whiteDots.push(...cpsElevated.toList());


        // step 3: fit a plane through the points, and project to this plane
        let plane = Plane.fromLeastSquares(cpsElevated);
        cpsElevated.forEach((p) => plane.pullToPlane(p));
        let cpsFixed = cpsElevated.to2D();
        
        // step 4: ransac! 
        let rss = ransacSettings;
        let r = RansacCircle2d(cpsFixed, rss.iterations, rss.radius, rss.tolerance, rss.seed, rss.min_score, rss.max_radius_deviation);

        let eyepoint;
        let bestCircle;
        if (!r) {
            console.error("couldnt find eyepoint...");
            return;
        } else {
            let [bestCircle, values] = r;
            eyepoint = plane.pushToWorld(bestCircle.center.to3D());    
            this.app?.lineRenderables.push(LineArray.fromCircle(Circle3.fromCircle2(bestCircle, plane)));
        }

        // debug
        cpsElevated.forEach((p) => {
            p.z = 0;
            return plane.pushToWorld(p);
        })
        
        this.app?.lineRenderables.push(LineArray.fromPlane(plane));
        this.app?.redDots.push(eyepoint);
        
        return eyepoint;
    }


    private contrastDetection(image: GeonImage) : GeonImage {

        // console.log("processing image with size: ", image.width, image.height);

        let grey = image.toGreyscale();
        let blurred = grey.applyKernel(Kernels.Gauss5);
        let left = blurred.applyKernel(Kernels.SobelLeft);
        let right = blurred.applyKernel(Kernels.SobelRight);
        let sum = this.SobelSum(left, right);

        let [min, max] = sum.getMinMax();

        // console.log("minmax: ", min, max);

        let upper = max * 0.7;
        let lower = upper * 0.3;
        let thres = sum.applyThreshold(lower, upper);

        // debug 
        // console.log("adding images:")
        this.app?.images.push(blurred.toRGBA(), sum.toRGBA(), thres.toRGBA());
        
        return thres;
    }

    
    private SobelSum(hor: GeonImage, ver: GeonImage) : GeonImage {
        
        let width = hor.width; // assume the same as ver
        let height = hor.height; // assume the same as ver
        let ps = hor.pixelSize;

        let sum = new GeonImage(width, height, ps);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                
                // assume grey value
                let one = hor.get(x, y)[0];
                let two = ver.get(x, y)[0];

                let value = Math.round((one**2 + two**2)**0.5);

                sum.set(x, y, [value, value, value, 255]);
            }
        }
        return sum;
    }


    private getEyeWindowsNextcloud(data: NextcloudScanData, mesh: TopoMesh) : [Domain2, Domain2] {
        
        let bb_o = data.settings.process.bounding_box_offset;

        console.log(bb_o);

        let eyeGuessLeft = data.eyePointsEdited.getVector(0);
        let eyeGuessRight = data.eyePointsEdited.getVector(1);

        console.log("groundTruthLeft, groundTruthRight");
        console.log(eyeGuessLeft, eyeGuessRight);

        this.app?.whiteDots?.push(eyeGuessLeft);
        this.app?.whiteDots?.push(eyeGuessRight);

        let eyeLandmarksLeft = mesh.flattenClosestPoint(eyeGuessLeft);
        let eyeLandmarksRight = mesh.flattenClosestPoint(eyeGuessRight);

        this.app?.whiteDots?.push(eyeLandmarksLeft.to3D());
        this.app?.whiteDots?.push(eyeLandmarksRight.to3D());

        // to texture pixel space 

        let mat = data.getTextureToUVMatrix().inverse();

        console.log(mat);

        // let mat = data.getTextureToUVMatrix().inverse();
        let leftPixel  = mat.multiplyVector(eyeLandmarksLeft.to3D()).to2D();
        let rightPixel = mat.multiplyVector(eyeLandmarksRight.to3D()).to2D();

        console.log("in pixelspace: ");
        console.log(leftPixel, rightPixel);

        let window = [-70, 70, -70, 70];
        let rightWindow = Domain2.fromInclude(Vector2Array.fromList([leftPixel])).offset(window);
        let leftWindow = Domain2.fromInclude(Vector2Array.fromList([rightPixel])).offset(window);

        return [rightWindow, leftWindow];
    }


    private getEyeWindows(bsd: BellusScanData) : [Domain2, Domain2] {

        let pr = bsd.settings.process.point_ranges;
        let bb_o = bsd.settings.process.bounding_box_offset;

        let eyeLandmarksLeft = bsd.landmarks.takeRows(pr.left_eye_set) as Vector2Array;
        let eyeLandmarksRight = bsd.landmarks.takeRows(pr.right_eye_set) as Vector2Array;

        let rightWindow = Domain2.fromInclude(eyeLandmarksLeft).offset(bb_o.ly);
        let leftWindow = Domain2.fromInclude(eyeLandmarksRight).offset(bb_o.ry);

        return [rightWindow, leftWindow];
    }


    private pixelsToPoints(image: GeonImage, threshold: number) : Vector2Array {

        let points: Vector2[] = [];
        for(let y = 0 ; y < image.height; y++) {
            for(let x = 0; x < image.width; x++) {
                let value = image.get(x, y)[0];
                if (value > threshold) {
                    points.push(new Vector2(x, y));
                }
            }
        }
        return Vector2Array.fromList(points);
    }
}