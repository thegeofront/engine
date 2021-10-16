// image.ts
// author: Jos Feenstra
// purpose: wrapper around the ImageData class,
// - in order to get more functionality out of it
//
// note: named GeonImage to not collide with Image classes.

// PROBLEM: this should be just a normal 2d uint16 matrix or something. 
// troubles occur with sobel operators, which go negative.
// its too many layers, this image abstraction should not be needed.  

import { Domain2 } from "../math/Domain";
import { FloatMatrix } from "../data/FloatMatrix";
import { ImageProcessing } from "./ImageProcessing";
import { BiSurface, Vector2, Vector3 } from "../lib";
import { Color } from "./Color";

// TODO : x and y are not the same as i and j, and used inconsistently. fix this.
// TODO : now that GEON is a package, we can use G.Image. the Geon suffix is not needed anymore is not needed anymore!
// TODO : rename to Texture, its not taken yet I think!
const acceptedKernels: number[] = [3, 5, 7, 9];

export class GeonImage {

    public data: Uint8ClampedArray;

    public readonly width: number;
    public readonly height: number;
    public readonly depth: number;
    
    public readonly count: number; // pixel count

    constructor(width: number, height: number, depth: number = 4, data?: Uint8ClampedArray) {
        
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.count = width * height;

        if (data) {
            this.data = data;
        } else {
            this.data = new Uint8ClampedArray(this.width * this.height * this.depth);
        }
    }

    get pixelSize() {
        return this.depth;
    }

    get dimentions() {
        return Vector3.new(this.width, this.height, this.pixelSize);
    }

    static new(width: number, height: number, depth=4) {
        return new GeonImage(width, height, depth);
    }

    static fromImageData(id: ImageData): GeonImage {
        let image = new GeonImage(id.width, id.height, 4);
        image.setData(id.data);
        return image;
    }

    toImageData(): ImageData {
        console.log("called to image data is not needed anymore!!");

        // imagedata requires pixelsize of 4.
        if (this.depth == 1) {
            console.log("conferting to rgba...");
            return ImageProcessing.imagedataFromTrueGreyscale(this);
        } else if (this.depth != 4) {
            throw "depth must be 4 for toImageData to work";
        }
        return new ImageData(this.data, this.width, this.height);
    }

    setData(data: Uint8ClampedArray) {
        if (data.length != this.height * this.width * this.depth)
            throw "data.length does not match width * height ";

        this.data = data;
    }

    clone() {
        let image = new GeonImage(this.width, this.height, this.depth);
        image.setData(this.data);
        return image;
    }

    copyFrom(other: GeonImage) {
        console.warn("TODO");
    }

    fill(pixel: number[]): GeonImage {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.set(j, i, pixel);
            }
        }
        return this;
    }

    fillEvery(filler: Function) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.set(j, i, filler());
            }
        }
        return this;
    }

    forEach(filler: (x: number, y: number) => number[]) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.set(j, i, filler(j, i));
            }
        }
    }

    /**
     * Perform an operation to every pixel of an image
     */
    forEachPixel(operation: (pixel: number[], i: number, j: number) => number[]) {
        let result = new GeonImage(this.width, this.height, this.pixelSize);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let pixel = this.get(i, j);
                pixel = operation(pixel, i, j);
                result.set(i, j, pixel);
            }
        }
        return result;
    }

    /**
     * Perform an operation to every pixel of a greyscale image
     * I made this, because iteration is much simpler if we are dealing with greyscale images
     */
    forEachGreyscalePixel(operation: (val: number) => number) {
        
        if (this.depth != 1) {
            throw new Error("this is not a greyscale image!");
        }
        
        let result = new GeonImage(this.width, this.height, 1);
        for (let i = 0 ; i < this.data.length; i++) {
            this.data[i] = operation(this.data[i]);
        }
        return result;
    }

    includes(x: number, y: number): boolean {
        return x < this.width && x >= 0 && y < this.height && y >= 0;
    }

    // [GETTING & SETTING]

    setVal(i: number, j: number, k: number, val: number) {
        this.data[this.depth * (j * this.width + i) + k] = val;
    }

    getVal(i: number, j: number, k: number) {
        return this.data[this.depth * (j * this.width + i) + k];
    }

    // TODO rename getPixel
    get(i: number, j: number): number[] {
        return this.getWithIndex(this.vecToIndex(i, j));
    }

    // TODO rename setPixel
    set(i: number, j: number, pixel: number[]) {
        return this.setWithIndex(this.vecToIndex(i, j), pixel);
    }

    getWithIndex(index: number) {
        let pixel = new Array<number>(this.depth);
        for (let k = 0 ; k < this.depth; k++) {
            pixel[k] = this.data[(this.depth * index) + k];
        }
        return pixel;
    }

    setWithIndex(index: number, pixel: number[]) {
        for (let k = 0 ; k < this.depth; k++) {
            this.data[this.depth * index + k] = pixel[0];
        }
    }

    // NOTE: this should be fixed on the level of an nD array

    vecToIndex(x: number, y: number) {
        return  y * this.width + x;
    }

    indexToVec(index: number) {
        let base = Math.floor(index / this.width);
        let left = index - base * this.width;
        return Vector2.new(left, base);
    }

    getNbIndices(index: number) {
        let nbs = new Array<number>();

        if (index >= this.width * this.height) return nbs;

        // make sure we dont add out of bound dudes
        if (index % this.width != 0) nbs.push(index - 1);
        if ((index+1) % this.width != 0) nbs.push(index + 1);
        if (index - this.width > 0) nbs.push(index - this.width);
        if (index + this.width < this.width * this.height) nbs.push(index + this.width);

        return nbs;
    }

    getNbIndices8(index: number) {
        let nbs = new Array<number>();
        let size = this.width * this.height;
        if (index >= size) return nbs;

        let hasLeft = index % this.width != 0;
        let hasRight = (index+1) % this.width != 0;
        let hasTop = index - this.width > 0;
        let hasBot = index + this.width < size;

        if (hasLeft) nbs.push(index - 1);
        if (hasRight) nbs.push(index + 1);
        if (hasTop) nbs.push(index - this.width);
        if (hasBot) nbs.push(index + this.width);

        if (hasTop && hasLeft)  nbs.push(index - this.width - 1);
        if (hasTop && hasRight)  nbs.push(index - this.width + 1);
        if (hasBot && hasLeft) nbs.push(index + this.width - 1);
        if (hasBot && hasRight) nbs.push(index + this.width + 1);

        return nbs;
    }

    flipHor(): GeonImage {
        let image = new GeonImage(this.width, this.height, this.pixelSize);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let jMirror = this.width - 1 - j;
                image.set(j, i, this.get(jMirror, i));
            }
        }
        return image;
    }

    flipVer(): GeonImage {
        let image = new GeonImage(this.width, this.height, this.pixelSize);
        for (let i = 0; i < this.height; i++) {
            let iMirror = this.height - 1 - i;
            for (let j = 0; j < this.width; j++) {
                image.set(j, i, this.get(j, iMirror));
            }
        }
        return image;
    }

    applyKernel(kernel: FloatMatrix): GeonImage {
        // determine kernel size
        let size = kernel.count();
        let radius = size / 2 - 0.5;

        let image = new GeonImage(
            this.width - radius * 2,
            this.height - radius * 2,
            this.pixelSize,
        );

        // old image space
        for (let i = radius; i < this.width - radius; i++) {
            for (let j = radius; j < this.height - radius; j++) {
                let pixel = this.getWithKernel(i, j, kernel, radius);
                image.set(i - radius, j - radius, pixel);
            }
        }

        return image; // succes
    }

    getMinMax(): [number, number] {
        // get the minimum and maximum pixel value
        // assumes pixelsize = 1

        let min = Infinity;
        let max = 0;

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i] < min) {
                min = this.data[i];
            } else if (this.data[i] > max) {
                max = this.data[i];
            }
        }

        return [min, max];
    }

    applyThreshold(lower: number, upper: number) {
        return this.apply((x: number, y: number) => {
            let pixel = this.get(x, y);

            if (pixel[0] < lower) {
                return [0, 0, 0, 0];
            } else if (pixel[0] > upper) {
                return [255, 255, 255, 255];
            } else {
                return pixel;
            }
        });
    }

    apply(filler: Function): GeonImage {
        let copy = new GeonImage(this.width, this.height, this.pixelSize);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                copy.set(x, y, filler(x, y));
            }
        }
        return copy;
    }

    getWithKernelGrey(i: number, j: number, kernel: FloatMatrix, radius: number): number {
        // kernel space
        let sum = 0;
        for (let ki = 0; ki < kernel.width; ki++) {
            for (let kj = 0; kj < kernel.height; kj++) {
                let weight = kernel.get(ki, kj);
                let pixel = this.getVal(i + ki - radius, j + kj - radius, 0);
                sum += pixel * weight;     
            }
        }
        return sum;
    }

    getWithKernel(i: number, j: number, kernel: FloatMatrix, radius: number): number[] {
        // kernel space
        let sum = [0, 0, 0, 255];
        for (let ki = 0; ki < kernel.width; ki++) {
            for (let kj = 0; kj < kernel.height; kj++) {
                let weight = kernel.get(ki, kj);
                let pixel = this.get(i + ki - radius, j + kj - radius);

                for (let i = 0; i < 3; i++) {
                    sum[i] += pixel[i] * weight;
                }
            }
        }
        return sum;
    }

    setAplha(a: number) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let pixel = this.get(x, y);
                this.set(x, y, [pixel[0], pixel[1], pixel[2], a]);
            }
        }
        return this;
    }

    scale(scaleX: number, scaleY: number): GeonImage {
        // scale the image to a new width and height, using nearest neighbour
        return this.resize(Math.round(this.width * scaleX), Math.round(this.height * scaleY));
    }

    resize(width: number, height: number): GeonImage {
        // resize the image to a new width and height, using nearest neighbour
        const image = new GeonImage(width, height, this.pixelSize);
        const old = this;

        const x_factor = (1 / image.width) * old.width;
        const y_factor = (1 / image.height) * old.height;

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                let pixel = old.get(Math.round(x * x_factor), Math.round(y * y_factor));
                image.set(x, y, pixel);
            }
        }

        return image;
    }

    // add borders till this size is achieved
    buffer(width: number, height: number): GeonImage {
        const image = new GeonImage(width, height, this.pixelSize);
        const old = this;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // console.log(x, y);
                if (old.includes(x, y)) {
                    image.set(x, y, old.get(x, y));
                }
            }
        }

        // for (let y = 0; y < height; y++) {
        //     for (let x = 0; x < width; x++) {
        //         image.set(x, y, [x,0,0,255]);
        //     }
        // }

        // build some simple image instead to test
        // for (let i = 0; i < image.data.length / 4; i++) {
        //     image.data[i*4 + 0] = i % 255;
        //     image.data[i*4 + 1] = 0;
        //     image.data[i*4 + 2] = 0;
        //     image.data[i*4 + 3] = 255;
        // }

        return image;
    }

    trimWithDomain(dom: Domain2) {
        const x1 = Math.round(dom.x.t0);
        const x2 = Math.round(dom.x.t1);
        const y1 = Math.round(dom.y.t0);
        const y2 = Math.round(dom.y.t1);

        return this.trim(x1, y1, x2, y2);
    }

    trim(x1: number, y1: number, x2: number, y2: number): GeonImage {
        // return a hardcopy of this particular window
        const imageWidth = x2 - x1;
        const imageHeight = y2 - y1;

        const image = new GeonImage(imageWidth, imageHeight, this.pixelSize);

        for (let y = 0; y < imageHeight; y++) {
            for (let x = 0; x < imageWidth; x++) {
                let pixel = this.get(x + x1, y + y1);
                image.set(x, y, pixel);
            }
        }

        return image;
    }

    toGreyscale(): GeonImage {
        if (this.pixelSize != 4) throw "please, only use this when pixelsize is 4";

        let image = new GeonImage(this.width, this.height, 4);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let pixel = this.get(x, y);
                let avg = (pixel[0] + pixel[1] + pixel[2]) / 3;
                image.set(x, y, [avg, avg, avg, 255]);
            }
        }
        return image;
    }

    toRGBA(): GeonImage {
        // if (this.pixelSize != 1) throw "please, only use this when pixelsize is 1"

        return this;

        // let image = new GeonImage(this.width, this.height, 4);
        // for (let y = 0; y < this.height; y++) {
        //     for (let x = 0; x < this.width; x++) {
        //         let pixel = this.get(x,y);
        //         let val = pixel[0];
        //         image.set(x, y, [val, val, val, 255]);
        //     }
        // }
        // return image;
    }

    /**
     * Do a bucketfill (like the ms-paint tool)
     */
    bucketFill(start: Vector2, color: Color, diagonals = false) : void {

        let startColor = this.get(start.x, start.y);
        let fillColor = color.toInt();

        let visitCondition = (val: number) : boolean => {
            let color = this.getWithIndex(val);
            return color[0] == startColor[0] && color[1] == startColor[1] && color[2] == startColor[2] && color[3] == startColor[3];
        }

        let visitAction = (val: number) => {
            this.setWithIndex(val, fillColor);
        }

        let getNeighbors: (val: number) => Array<number>;

        if (diagonals) {
            getNeighbors = this.getNbIndices8.bind(this)
        } else {
            getNeighbors = this.getNbIndices.bind(this)
        }

        this.bucketFillCustom(start, visitCondition, visitAction, getNeighbors);
    }


    /**
     * Do a custom bucketfill (like the ms-paint tool)
     * @param image 
     * @param start 
     * @param visitCondition if this returns true, we should visit the pixel with this index 
     * @param visitAction what to do at a visit
     * @param getNeighbors how to get the neighoring indices
     */
    bucketFillCustom(
        start: Vector2, 
        visitCondition: (index: number) => boolean, 
        visitAction: (index: number) => void, 
        getNeighbors: (val: number) => Array<number>) {

        let checked = new Set<number>();
        let toVisit = new Array<number>();

        let startIndex = this.vecToIndex(start.x, start.y); 

        toVisit.push(startIndex);
        checked.add(startIndex);

        while (toVisit.length > 0) {
            let cursor = toVisit.pop()!;
            
            visitAction(cursor);

            for (let nb of getNeighbors(cursor)) {
                if (checked.has(nb)) continue;
                checked.add(nb);
                if (!visitCondition(nb)) continue;
                toVisit.push(nb);
            }
        }
    }
}
