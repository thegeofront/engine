// image.ts
// author: Jos Feenstra
// purpose: wrapper around the ImageData class, 
// - in order to get more functionality out of it
// 
// note: named GeonImage to not collide with Image classes.

import { Matrix } from "../math/matrix";

const acceptedKernels : number[] = [3,5,7,9];
export class GeonImage {

    private data: Uint8ClampedArray;
    public readonly width: number;
    public readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new ImageData(width, height).data;
    }

    static fromImageData(id: ImageData) : GeonImage {
        let gi = new GeonImage(id.width, id.height);
        gi.setData(id.data);
        return gi
    }

    public applyKernel(kernel: Matrix) : GeonImage {

        // determine kernel size
        let size = kernel.width;
        let radius = (size / 2) - 0.5;
        let image = new GeonImage(this.width - radius * 2, this.height - radius * 2);

        // old image space
        for (let x = radius ; x < this.width - radius; x++) {
            for (let y = radius; y < this.height - radius; y++) {
                let pixel = this.getWithKernel(x, y, kernel, radius)
                image.set(x-radius, y-radius, pixel);
            }
        }

        return image; // succes 
    }

    private getWithKernel(x: number, y: number, kernel: Matrix, radius: number) : number[] {
        
        // kernel space
        let sum = [0, 0, 0, 255];
        for (let kx = 0 ; kx < kernel.width; kx++) {
            for (let ky = 0; ky < kernel.height; ky++) {

                let weight = kernel.get(kx, ky);
                let pixel = this.get(x + kx - radius, y + ky - radius);
                
                for (let i = 0 ; i < 3; i++) {
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

    scale(scaleX: number, scaleY: number) : GeonImage {

        // scale the image to a new width and height, using nearest neighbour
        return this.resize(
            Math.round(this.width * scaleX), 
            Math.round(this.height * scaleY)
            );
    }

    resize(width: number, height: number) : GeonImage {
        
        // resize the image to a new width and height, using nearest neighbour
        const image = new GeonImage(width, height);
        const old = this;

        const x_factor = ( 1 / image.width ) * old.width;
        const y_factor = ( 1 / image.height) * old.height;

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                let pixel = this.get(
                    Math.round(x * x_factor), 
                    Math.round(y * y_factor));
                image.set(x, y, pixel);
            }
        }

        return image;
    }

    trim(x1: number, y1: number, x2: number, y2: number) : GeonImage {

        // return a hardcopy of this particular window
        const imageWidth = x2 - x1;
        const imageHeight = y2 - y1;

        const image = new GeonImage(imageWidth, imageHeight);

        for (let y = 0; y < imageHeight; y++) {
            for (let x = 0; x < imageWidth; x++) {
                let pixel = this.get(x + x1, y + y1);
                image.set(x, y, pixel);
            }
        }

        return image;
    }

    greyScale() : GeonImage {

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let pixel = this.get(x,y);
                let avg = (pixel[0] + pixel[1] + pixel[2]) / 3;
                this.set(x, y, [avg, avg, avg, 255]);
            }
        }
        return this;
    }

    setData(data: Uint8ClampedArray) {
        if (data.length != (this.height * this.width * 4))
            throw "data.length does not match width * height ";

        this.data = data;
    }

    fill(pixel: number[]) : GeonImage {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.set(x, y, pixel);
            }
        }
        return this;
    }

    fillEvery(filler: Function) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.set(x, y, filler());
            }
        }
        return this;
    }
    
    public set(x: number, y: number, pixel: number[]) {

        if (x > this.width || x < 0) throw "out of bounds";
        if (y > this.height || y < 0) throw "out of bounds";

        this.data[4 * (y * this.width + x)] = pixel[0];
        this.data[4 * (y * this.width + x)+1] = pixel[1];
        this.data[4 * (y * this.width + x)+2] = pixel[2];
        this.data[4 * (y * this.width + x)+3] = pixel[3];
    }

    public get(x: number, y: number) : number[] {

        if (x > this.width || x < 0) throw "out of bounds";
        if (y > this.height || y < 0) throw "out of bounds";

        return [
            this.data[4 * (y * this.width + x)],
            this.data[4 * (y * this.width + x) + 1],
            this.data[4 * (y * this.width + x) + 2],
            this.data[4 * (y * this.width + x) + 3]
        ]
    }

    public getImageData() : ImageData {

        return new ImageData(this.data, this.width, this.height);
    }
}