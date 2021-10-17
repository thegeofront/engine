import { Texture } from "../../lib";
import { TEXTURE_2D } from "./Constants";
import { WebGl, HelpGl } from "./HelpGl";

/**
 * Note: arguments can be made for splitting up 'uniform' & 'texture' 
 */
 export class UniformTexture {
    private constructor(
        private gl: WebGl, 
        public id: number, 
        private texture: WebGLTexture | null,
        private loc: WebGLUniformLocation) {}

    static new(gl: WebGl, program: WebGLProgram, name: string) {
        let location = gl.getUniformLocation(program, name)!;
        // let location = 0;
        let id = HelpGl.getNextTextureID();
        let texture = gl.createTexture()!;
        return new UniformTexture(gl, id, texture, location)
    }

    /**
     * 'normal' loading
     */
    load(texture: Texture) {
        if (texture.depth != 4) {
            throw new Error("sorry, but I haven't figured out how to load non-rgba textures...");
        }
        this.loadArrayBuffer(texture.width, texture.height, texture.data);
    }

    /**
     * loading indirectly with imageData. 
     */
    loadImageData(imgData: ImageData) {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.id);
        this.gl.bindTexture(TEXTURE_2D, this.texture);
        this.gl.texImage2D(TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imgData);
        // alternative texture -> Fill the texture with a 1x1 blue pixel.
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 128, 128, 255]));
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture.data);
        this.gl.texParameteri(TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.generateMipmap(TEXTURE_2D);
    }

    /**
     * loading directly with an array buffer view. 
     */
    loadArrayBuffer(width: number, height: number, source: ArrayBufferView) {

        let gl = this.gl;
        this.gl.activeTexture(this.gl.TEXTURE0 + this.id);
        this.gl.bindTexture(TEXTURE_2D, this.texture);
    
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, border, srcFormat, srcType, source);
    
        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(width) && isPowerOf2(height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }

    /**
     * 'meta loading'. change the underlying webglTexture to a different adress. 
     * this way, prerendered textures can be 'loaded' from a drawTarget, for example
     */
    setSource(texture: WebGLTexture | null) {
        this.texture = texture;
    }

    bind(gl: WebGl) {
        gl.uniform1i(this.loc, this.id);
        gl.activeTexture(gl.TEXTURE0 + this.id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    unbind() {
        throw "TODO";
    }
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
}