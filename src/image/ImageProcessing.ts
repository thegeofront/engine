import { DebugRenderer, ImageMesh, IntMatrix, Plane, Vector2, Vector3 } from "../lib";
import { Color } from "./Color";
import { GeonImage } from "./Image";
import { Kernels } from "./Kernels";

export namespace ImageProcessing {
    export function imagedataFromTrueGreyscale(grey: GeonImage) {
        let rgba = new Uint8ClampedArray(grey.width * grey.height * 4);

        for (let i = 0; i < grey.width; i++) {
            for (let j = 0; j < grey.height; j++) {
                let val = grey.get(j, i)[0];
                if (i == 0 && j == 0) {
                    console.log(grey.get(100, 100));
                }
                rgba[4 * (i * grey.width + j)] = val;
                rgba[4 * (i * grey.width + j) + 1] = val;
                rgba[4 * (i * grey.width + j) + 2] = val;
                rgba[4 * (i * grey.width + j) + 3] = 255;
            }
        }
        // let rgba = new GeonImage(grey.width, grey.height, 4);
        // rgba.fillEvery((x: number, y: number) => {
        //     let pixel = grey.get(x, y);
        //     return [pixel[0], pixel[0], pixel[0], 255];
        // });
        return new ImageData(rgba, grey.width, grey.height);
    }

    /**
     * Returns a greyscale image which still contains
     */
    export function fakeGreyscale(rgba: GeonImage): GeonImage {
        if (rgba.pixelSize != 4) throw "please, only use this when pixelsize is 4";

        let image = new GeonImage(rgba.width, rgba.height, 4);
        for (let y = 0; y < rgba.height; y++) {
            for (let x = 0; x < rgba.width; x++) {
                let pixel = rgba.get(x, y);
                let avg = (pixel[0] + pixel[1] + pixel[2]) / 3;
                image.set(x, y, [avg, avg, avg, 255]);
            }
        }
        return image;
    }

    export function trueGreyscale(rgba: GeonImage) {

        let grey = new GeonImage(rgba.width, rgba.height, 1);

        for (let i = 0 ; i < grey.data.length; i++) {
            let pixel = rgba.getWithIndex(i);
            let round = (pixel[0] + pixel[1] + pixel[2]) / 3;
            grey.data[i] = round;
        }

        return grey;
    }

    // ------ [ CANNY EDGE DETECTION ] --------

    /**
     * This performs a pythagorean sum of a vertical & horizontal sobel kernel.
     * @returns [gradient: GeonImage, direction: GeonImage]
     */
    export function sobelMD(image: GeonImage): [GeonImage, GeonImage] {
        let kernelLeft = Kernels.SobelLeft;
        let kernelUp = Kernels.SobelUp;

        let size = kernelLeft.count();
        let radius = size / 2 - 0.5;
        let newWidth = image.width - radius * 2;
        let newHeight = image.height - radius * 2;

        let directionImage = new GeonImage(newWidth, newHeight, 4);
        let magnitudeImage = new GeonImage(newWidth, newHeight, 4);

        for (let i = radius; i < image.width - radius; i++) {
            for (let j = radius; j < image.height - radius; j++) {
                let deltaX = image.getWithKernelGrey(i, j, kernelLeft, radius);
                let deltaY = image.getWithKernelGrey(i, j, kernelUp, radius);

                // note: this was an idea do use all color differences, instead of just greyscale colors. Results are unpredictable however...
                // take the maximum color difference;
                // let deltaX = Math.sqrt(pixelX[0] * pixelX[0] + pixelX[1] * pixelX[1] + pixelX[2] * pixelX[2]) / 2;
                // let deltaY = Math.sqrt(pixelY[0] * pixelY[0] + pixelY[1] * pixelY[1] + pixelY[2] * pixelY[2]) / 2;

                let gradient = Math.pow(deltaX * deltaX + deltaY * deltaY, 0.5);

                let desI = i - radius;
                let desJ = j - radius;

                directionImage.set(desI, desJ, [(deltaX + 255) / 2, (deltaY + 255) / 2, 255, 255]);
                directionImage.set(desI, desJ, [128, 255, 128, 255]);
                magnitudeImage.set(desI, desJ, [gradient]);
            }
        }

        return [magnitudeImage, directionImage];
    }

    /**
     * Take a bump map, or a direction image, and convert it to a `theta-angle-greyscale` image.
     *
     */
    export function thetaMap(direction: GeonImage) {

        let result = GeonImage.new(direction.width, direction.height, 1);

        for (let i = 0; i < direction.depth; i++) {
            let pixel = direction.getWithIndex(i);
            let theta = Math.atan2(pixel[1] - 128, pixel[0] - 128);

            // normalize to [0 - 1] space;
            theta = (theta + Math.PI) / (Math.PI * 2);

            // put back into a greyscale image
            theta = theta * 255;
            result.setWithIndex(i, [theta]);
        }

        return result;
    }

    /**
     * Clamp a theta-map to `x` number of directions
     */
    export function clampGreyscale(image: GeonImage, numberOfValues: number) {
        let result = image.forEachGreyscalePixel((val) => {
            return Math.round((val / 255) * numberOfValues) % numberOfValues;
        });
        return result;
    }

    /**
     * Take the canny process, but render all in-between steps
     */
    export function canny(
        original: GeonImage,
        blurSigma = 1.4,
        blurSize = 3,
        lower = 100,
        upper = 200,
        dr?: DebugRenderer,
    ) {
        const weak = 128;
        const strong = 255;

        let grey = ImageProcessing.fakeGreyscale(original);
        let gauss = Kernels.generateGaussianKernel(blurSigma, blurSize);
        let blurred = grey.applyKernel(gauss);
        let [magnitude, direction] = ImageProcessing.sobelMD(blurred);
        let thetaDirections = ImageProcessing.thetaMap(direction);
        let supressed = ImageProcessing.cannyNonMaximumSuppression(magnitude, thetaDirections);
        let thressed = ImageProcessing.cannyThreshold(supressed, lower, upper, weak, strong);
        let result = ImageProcessing.cannyHysteresis(thressed, weak, strong);

        // early out if we are not interested in debugging
        if (!dr) {
            return result;
        }

        let offset = 0;
        let addToDR = (img: GeonImage, label: string) => {
            let plane = Plane.WorldYZ().moveTo(Vector3.new(-offset, 0, 0));
            dr?.set(ImageMesh.new(img, plane, 1, false, true), label);
            offset += 10;
        };

        addToDR(original, "original");
        addToDR(grey, "grey");
        addToDR(blurred, "blurred");
        addToDR(magnitude, "sobel magnitude");
        addToDR(direction, "sobel direction");
        addToDR(supressed, "supressed");
        addToDR(thressed, "threshold");
        addToDR(result, "hysteresis");
        return result;
    }

    /**
     *
     */
    export function cannyNonMaximumSuppression(magnitude: GeonImage, direction: GeonImage) {
        // dir is from 0 to 255

        // if (magnitude.depth != 1 || direction.depth != 1) {
        //     throw "needs two greyscale images";
        // }

        let magGet = (i: number, j: number) => {
            return magnitude.getVal(i, j, 0);
        };

        let range = 1;
        let result = new GeonImage(
            magnitude.width - range * 2,
            magnitude.height - range * 2,
            1,
        );

        for (let i = range; i < magnitude.width - range; i++) {
            for (let j = range; j < magnitude.height - range; j++) {
                const mag = magGet(i, j);
                const dir = direction.getVal(i, j, 0) % 128;

                let val = mag;

                // per direction bucket (dir is angle from 0 to 255)
                if (dir >= 16 && dir < 48) {
                    // diagonal-/
                    if (magGet(i + 1, j + 1) > mag || magGet(i - 1, j - 1) > mag) val = 0;
                } else if (dir >= 48 && dir < 80) {
                    // vertical
                    if (magGet(i, j - 1) > mag || magGet(i, j + 1) > mag) val = 0;
                } else if (dir >= 80 && dir < 112) {
                    // diagonal-\
                    if (magGet(i + 1, j - 1) > mag || magGet(i - 1, j + 1) > mag) val = 0;
                } else {
                    // horizontal
                    if (magGet(i - 1, j) > mag || magGet(i + 1, j) > mag) val = 0;
                }

                result.setVal(i, j, 0, val);
            }
        }

        return result;
    }

    export function cannyThreshold(
        image: GeonImage,
        lower: number,
        upper: number,
        weakValue: number,
        strongValue: number,
    ) {

        let result = image.forEachGreyscalePixel((val) => {
            if (val < lower) {
                return 0;
            } else if (val >= lower && val < upper) {
                return weakValue;
            } else {
                return strongValue;
            }
        });
        return result;
    }

    export function cannyHysteresis(image: GeonImage, weakValue: number, strongValue: number) {
        let result = GeonImage.new(image.width, image.height).fill([0,0,0,255]);

        let condition = (index: number) => {
            let val = image.getWithIndex(index)[0];
            return val == weakValue;
        };

        let action = (index: number) => {
            result.setWithIndex(index, [strongValue, strongValue, strongValue, 255]);
        };

        for (let i = 0; i < image.depth; i++) {
            let pixel = image.getWithIndex(i)[0];
            if (pixel != strongValue) continue;

            // fill all adjacent weak values recursively
            let vec = image.indexToVec(i);
            image.bucketFillCustom(vec, condition, action, image.getNbIndices8.bind(image));
            // break;
        }
        return result;
    }

    /**
     * same as image.bucketfill, but functional style
     */
    export function bucketFill(
        image: GeonImage,
        start: Vector2,
        color: Color,
        diagonal = false,
    ): GeonImage {
        image.clone();
        image.bucketFill(start, color, diagonal);
        return image;
    }


    export function equalizeHistogram(image: GeonImage) {
        
    }
}
