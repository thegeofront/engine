import { DebugRenderer, ImageMesh, Plane, Vector3 } from "../lib";
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

        for (let i = 0; i < grey.height; i++) {
            for (let j = 0; j < grey.width; j++) {
                grey.data[1 * (i * grey.width + j)] = 0;
            }
        }

        // grey.forEach((x: number, y: number) => {
        //     let pixel = rgba.get(y, x);
        //     pixel = [126, 126, 126, 255];
        //     return [Math.round(pixel[0] + pixel[1] + pixel[2] / 3)];
        // });

        return grey;
    }

    export function gaussianBlur5(image: GeonImage): GeonImage {
        image = image.applyKernel(Kernels.Gauss5);
        return image;
    }

    /**
     * This performs a pythagorean sum of a vertical & horizontal sobel kernel.
     * @returns [gradient: GeonImage, direction: GeonImage]
     */
    export function sobel(image: GeonImage): [GeonImage, GeonImage] {
        let kernelLeft = Kernels.SobelLeft;
        let kernelUp = Kernels.SobelUp;

        let size = kernelLeft.count();
        let radius = size / 2 - 0.5;
        let newWidth = image.width - radius * 2;
        let newHeight = image.height - radius * 2;

        let gradientImage = new GeonImage(newWidth, newHeight, image.pixelSize);
        let directionImage = new GeonImage(newWidth, newHeight, image.pixelSize);

        for (let i = radius; i < image.width - radius; i++) {
            for (let j = radius; j < image.height - radius; j++) {
                let deltaX = image.getWithKernel(i, j, kernelLeft, radius)[0];
                let deltaY = image.getWithKernel(i, j, kernelUp, radius)[0];

                let gradient = Math.pow(deltaX * deltaX + deltaY * deltaY, 0.5);

                let desI = i - radius;
                let desJ = j - radius;

                directionImage.set(desI, desJ, [(deltaX + 255) / 2, (deltaY + 255) / 2, 255, 255]);
                gradientImage.set(desI, desJ, [gradient, gradient, gradient, 255]);
            }
        }

        return [gradientImage, directionImage];
    }

    /**
     * Take a bump map, or a direction image, and convert it to a `theta-angle-greyscale` image.
     *
     */
    export function thetaMap(direction: GeonImage) {

        console.time();
        let result = direction.forEachPixel((pixel, i, j) => {
            
            // get the angle a (x,y) vector makes with a (1,0) vector. result From -PI to PI.
            let theta = Math.atan2(pixel[1] - 128, pixel[0] - 128);

            // normalize to [0 - 1] space;
            theta = (theta + Math.PI) / (Math.PI * 2);

            // put back into a greyscale image
            theta = theta * 255;
            return [theta, theta, theta, 255];
        })

        return result;
    }

    /**
     * Clamp a theta-map to `x` number of directions
     */
    export function clampDirections(theta: GeonImage, numberOfDirections: number) {
        let result = theta.forEachGreyscalePixel((val) => {
            return Math.round((val / 255) * numberOfDirections) % numberOfDirections;
        })
        return result;
    }

    /**
     *
     */
    export function thinSobelEdges(gradient: GeonImage, eightDirectionalTheta: GeonImage) {
        
        let radius = 1;
        let newWidth = gradient.width - radius * 2;
        let newHeight = gradient.height - radius * 2;

        let thinned = new GeonImage(newWidth, newHeight, gradient.pixelSize);
  
        for (let i = radius; i < gradient.width - radius; i++) {
            for (let j = radius; j < gradient.height - radius; j++) {
                

                thinned.set(i-radius, j-radius, [255, 255, 255, 255]);
            }
        }
        return thinned;
    }

    export function canny(original: GeonImage) {
        let grey = original.toGreyscale();
        let blurred = ImageProcessing.gaussianBlur5(grey);
        let [gradient, direction] = ImageProcessing.sobel(blurred);
        let theta = ImageProcessing.thetaMap(direction);
        let thetaClamped = ImageProcessing.clampDirections(theta, 8);
    }

    function applyNMS(image: GeonImage): GeonImage {
        // determine kernel size
        let size = 3;
        let radius = size / 2 - 0.5;
        let copy = new GeonImage(
            image.width - radius * 2,
            image.height - radius * 2,
            image.pixelSize,
        );

        // old image space
        for (let i = radius; i < image.width - radius; i++) {
            for (let j = radius; j < image.height - radius; j++) {
                // let pixel = this.getWithKernel(i, j, kernel, radius)
                // copy.set(i-radius, j-radius, pixel);
            }
        }

        // img.eachPixel(3, function(x, y, c, n) {
        //     if (n[1][1] > n[0][1] && n[1][1] > n[2][1]) {
        //         copy.data[x][y] = n[1][1];
        //     } else {
        //         copy.data[x][y] = 0;
        //     }
        //     if (n[1][1] > n[0][2] && n[1][1] > n[2][0]) {
        //         copy.data[x][y] = n[1][1];
        //     } else {
        //         copy.data[x][y] = 0;
        //     }
        //     if (n[1][1] > n[1][0] && n[1][1] > n[1][2]) {
        //         copy.data[x][y] = n[1][1];
        //     } else {
        //         copy.data[x][y] = 0;
        //     }
        //     if (n[1][1] > n[0][0] && n[1][1] > n[2][2]) {
        //         return copy.data[x][y] = n[1][1];
        //     } else {
        //         return copy.data[x][y] = 0;
        //     }
        // });
        return copy;
    }
}
