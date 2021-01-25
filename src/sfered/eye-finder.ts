// name:    eye-finder.ts
// author:  Jos Feenstra
// purpose: Keeper of the full pupil-point.

import { EyeFinderApp } from "../app/eye-finder-app";
import { Mesh, TopoMesh } from "../geo/mesh";
import { GeonImage } from "../img/Image";
import { Kernels } from "../img/kernels";
import { Vector2Array, Vector3Array } from "../math/array";
import { Domain2 } from "../math/domain";
import { Vector2 } from "../math/vector";
import { DotRenderer3 } from "../render/dot-renderer3";
import { BellusScanData } from "./bellus-data";



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
        console.log(winLeft, winRight);

        let topo = TopoMesh.copyFromMesh(bsd.mesh);

        // left side
        this.findPupilFromEye(image, topo, winLeft);

        // right side
        this.findPupilFromEye(image, topo, winRight);

    }

    private findPupilFromEye(image: GeonImage, mesh: TopoMesh,  window: Domain2) {

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
        this.app?.dots2.push(...contrastPoints.toNativeArray());

        // step 2: elevate from uv space to vertex space of the mesh 
        let contrast3d = new Vector3Array(contrastPoints.count()); 
        contrastPoints.forEach((p, i) => {
            contrast3d.setVector(i,  mesh.elevate(p));
        })

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

        return Vector2Array.fromNativeArray(points);
    }

}