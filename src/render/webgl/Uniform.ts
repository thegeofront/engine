import { TEXTURE_2D } from "./Constants";
import { HelpGl, WebGl } from "./HelpGl";

export enum UniformType {
    Float,
    Int,
}

export class Uniform {
    private constructor(
        public type: UniformType,
        public size: number,
        public loc: WebGLUniformLocation,
        public setter: Function,
    ) {}

    static new(
        gl: WebGl,
        program: WebGLProgram,
        name: string,
        type: UniformType,
        size: number,
        initState?: Iterable<number>,
    ) {
        let setter = getLoader(gl, type, size);
        let loc = gl.getUniformLocation(program, name)!;
        let u = new Uniform(type, size, loc, setter);
        if (initState) {
            u.loadAndBind(gl, initState);
        }
        return u;
    }

    loadAndBind(gl: WebGl, state: Iterable<number>) {
        this.setter(gl, this.loc, state);
    }
}


/**
 * Note: arguments can be made for splitting up 'uniform' & 'texture' 
 */
export class UniformTexture {
    private constructor(
        private gl: WebGl, 
        public id: number, 
        private texture: WebGLTexture,
        private loc: WebGLUniformLocation) {}

    static new(gl: WebGl, program: WebGLProgram, name: string) {
        let location = gl.getUniformLocation(program, name)!;
        let id = HelpGl.getNextTextureID();
        let texture = gl.createTexture()!;
        return new UniformTexture(gl, id, texture, location)
    }

    load(source: TexImageSource) {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.id);
        this.gl.bindTexture(TEXTURE_2D, this.texture);
        this.gl.texImage2D(TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
        // alternative texture -> Fill the texture with a 1x1 blue pixel.
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 128, 128, 255]));
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture.data);
        this.gl.texParameteri(TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.generateMipmap(TEXTURE_2D);
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

function getLoader(gl: WebGl, type: UniformType, size: number): Function {
    switch (size) {
        case 1:
            if (type == UniformType.Float) {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform1fv(loc, state);
                };
            } else {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform1fv(loc, state);
                };
            }
        case 2:
            if (type == UniformType.Float) {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform2fv(loc, state);
                };
            } else {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform2fv(loc, state);
                };
            }
        case 3:
            if (type == UniformType.Float) {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform3fv(loc, state);
                };
            } else {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform3fv(loc, state);
                };
            }
        case 4:
            if (type == UniformType.Float) {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform4fv(loc, state);
                };
            } else {
                return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                    gl.uniform4fv(loc, state);
                };
            }
        case 9:
            return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                gl.uniformMatrix3fv(loc, false, state);
            };
        case 16:
            return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                gl.uniformMatrix4fv(loc, false, state);
            };
        default:
            return (gl: WebGl, loc: WebGLUniformLocation, state: Iterable<number>) => {
                console.error("could not set a certain uniform...");
            };
    }
}
