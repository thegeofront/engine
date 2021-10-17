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
