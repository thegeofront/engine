// name:    eye-finder.ts
// author:  Jos Feenstra
// purpose: Keeper of the full pupil-point.

import { EyeFinderApp } from "../app/eye-finder-app";
import { GeonImage } from "../img/Image";
import { Kernels } from "../img/kernels";
import { Vector2Array } from "../math/array";
import { Domain2 } from "../math/domain";
import { DotRenderer3 } from "../render/dot-renderer3";
import { BellusScanData } from "./bellus-data";



export class EyeFinder {

    app?: EyeFinderApp

    constructor(app?: EyeFinderApp) {
        this.app = app;
    }

    public findPupilsFromBellus(bsd: BellusScanData) {
        console.log("finding eyes..");

        let image = GeonImage.fromImageData(bsd.texture);
        let [winLeft, winRight] = this.getEyeWindows(bsd);

        console.log(winLeft);

        let eyeLeft = image.trimWithDomain(winLeft);
        let eyeRight = image.trimWithDomain(winRight);

        let edEyeLeft = this.edgeDetection(eyeLeft);

        // debug renderer
    }

    private edgeDetection(image: GeonImage) : GeonImage {

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
        
        return image;
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

    private findPupilFromEye() {

    }
}