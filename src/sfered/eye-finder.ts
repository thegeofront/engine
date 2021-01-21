// name:    eye-finder.ts
// author:  Jos Feenstra
// purpose: Keeper of the full pupil-point.

import { GeonImage } from "../img/Image";
import { BellusScanData } from "./bellus-data";

export class EyeFinder {

    constructor() {}

    public findPupilsFromBellus(bsd: BellusScanData) {
        console.log("finding eyes..");

        let image = GeonImage.fromImageData(bsd.texture);
        let windows = bsd.getEyeWindows();
        return;
    }

    private findPupilFromEye() {

    }
}