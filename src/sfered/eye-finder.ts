// name:    eye-finder.ts
// author:  Jos Feenstra
// purpose: Keeper of the full pupil-point.

import { EyeFinderApp } from "./eye-finder-app";
import { Mesh } from "../geo/mesh";
import { GeonImage } from "../img/Image";
import { Kernels } from "../img/kernels";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Domain2 } from "../math/domain";
import { Vector2, Vector3 } from "../math/vector";
import { DotRenderer3 } from "../render/dot-renderer3";
import { BellusScanData } from "./bellus-data";
import { TopoMesh } from "../geo/topo-mesh";
import { Plane } from "../geo/plane";
import { Matrix4 } from "../math/matrix";
import { RansacCircle2d } from "./ransac";
import { LineArray } from "../render/line-render-data";
import { Circle3 } from "../geo/circle3";



export class EyeFinder {

    app?: EyeFinderApp

    constructor(app?: EyeFinderApp) {
        this.app = app;
    }

    public findPupilsFromBellus(bsd: BellusScanData) {

        // the main script of finding pupil points directly from the bellus scan data. 
        console.log("finding eyes..");

        // get the window with which the eyes can be extracted
        let image = GeonImage.fromImageData(bsd.texture);
        let [winLeft, winRight] = this.getEyeWindows(bsd);
        // console.log(winLeft, winRight);

        let topo = TopoMesh.copyFromMesh(bsd.mesh);

        // left side
        let ransacSettings = bsd.settings.process_ransac;
        let leftPupilPoint = this.findPupilFromEye(image, topo, winLeft, ransacSettings);

        // right side
        // let rightPupilPoint = this.findPupilFromEye(image, topo, winRight);


    }

    private findPupilFromEye(image: GeonImage, mesh: TopoMesh,  window: Domain2, ransacSettings: any) {

        // step 1: get points (vectors) which symbolize pixels in contrasting areas of the image (the iris).
        let eyeImg = image.trimWithDomain(window);
        let contrastEyeImg = this.contrastDetection(eyeImg);
        let contrastPoints = this.pixelsToPoints(contrastEyeImg, 50);
        
        let scaleVec = new Vector2(1 / image.width, 1 / image.height);

        // convert these points to the same space as the uv points of the mesh
        contrastPoints.forEach((p) => {
           
            // move from eyetrim to original image space
            p.add(new Vector2(window.x.t0, window.y.t0));

            // move from pixel space to normalized uv space
            p.mul(scaleVec);

            // flip and move according to uv parameters
            p.mul(new Vector2(1, -1));
            p.add(new Vector2(0, 1));
        });

        // debug
        this.app?.dots2.push(...contrastPoints.toList());

        // step 2: elevate from uv space to vertex space of the mesh 
        let cps = new Vector3Array(contrastPoints.count()); 
        contrastPoints.forEach((p, i) => {
            cps.setVector(i,  mesh.elevate(p));
        })

        // step 3: fit a plane through the points, and project to this plane
        let plane = Plane.fromXYLeastSquares(cps);
        cps.forEach((p) => plane.pullToPlane(p));
        let cpsFixed = cps.to2D();
        
        // step 4: ransac! 
        let rss = ransacSettings;
        let [bestCircle, values] = RansacCircle2d(cpsFixed, rss.iterations, rss.radius, rss.tolerance, rss.seed, rss.min_score, rss.max_radius_deviation)!;
        let eyePoint = plane.pushToWorld(bestCircle.center.to3D());
      
        // debug
        cps.forEach((p) => {
            // p.z = 0;
            return plane.pushToWorld(p);
        })
        this.app?.whiteDots.push(...cps.toList());
        this.app?.lineRenderables.push(LineArray.fromPlane(plane));
        this.app?.redDots.push(eyePoint);
        this.app?.lineRenderables.push(LineArray.fromCircle(Circle3.fromCircle2(bestCircle, plane)));

        return Vector3.zero();
    }

    private contrastDetection(image: GeonImage) : GeonImage {

        let grey = image.toGreyscale();
        let blurred = grey.applyKernel(Kernels.Gauss5);
        let left = blurred.applyKernel(Kernels.SobelLeft);
        let right = blurred.applyKernel(Kernels.SobelRight);
        let sum = this.SobelSum(left, right);

        let [min, max] = sum.getMinMax();

        console.log("minmax: ", min, max);

        let upper = max * 0.7;
        let lower = upper * 0.3;
        let thres = sum.applyThreshold(lower, upper);

        // debug 
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

    private getEyeWindows(bsd: BellusScanData) : [Domain2, Domain2] {

        // get a window around the left- and right-eye feature points, so they can be extracted
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