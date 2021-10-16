// IDEA: I'm doing so much if checking with greyscale image. Could it be better to make
// it into a separate type of image? 

export abstract class Texture {

    constructor(
        public data: Uint8ClampedArray,
        public readonly width: number,
        public readonly height: number,
        public readonly depth: number,
    ) {}
    

}

/**
 * Make this separate, since 
 */
export class GreyTexture {

}