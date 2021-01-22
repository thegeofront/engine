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

        let blurred = image.applyKernel(Kernels.Gauss5);
        this.app?.images.push(image, blurred);
        return image;
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