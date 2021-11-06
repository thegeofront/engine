import { CubeMapTargets } from "./Constants";
import { HelpGl, WebGl } from "./HelpGl";
import { ShaderProgram } from "./ShaderProgram";


export class CubeMap {

    private constructor(
        private gl: WebGl, 
        public id: number, 
        private idPointer: WebGLUniformLocation,
        private texturePointer: WebGLTexture | null,
        ) {
            this.start();
        }

    static new(gl: WebGl, program: WebGLProgram, name: string) {
        let location = gl.getUniformLocation(program, name)!;
        let id = HelpGl.getNextTextureID();
        let texture = gl.createTexture()!;
        return new CubeMap(gl, id, location, texture);
    }

    start() {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texturePointer);
        CubeMapTargets.forEach((target) => {
            gl.texImage2D(target, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        });

        
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }

    loadUrls(urls: string[]) {

        let gl = this.gl;
        const pointer = this.texturePointer;
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, pointer);
        CubeMapTargets.forEach((target, i) => {
            const url = urls[i];

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;

            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function() {
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, pointer);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });

    }

    bind(gl: WebGl) {
        gl.uniform1i(this.idPointer, this.id);
        gl.activeTexture(gl.TEXTURE0 + this.id);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texturePointer);
    }
}