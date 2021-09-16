// Purpose: I was getting sick of dealing with separate widths, buffers & positions, even though these values are tied together :)

import { DrawSpeed, HelpGl, WebGl } from "./webgl";

/**
 * Wrapper for a webgl attibute
 */
export class Attribute {
    private constructor(
        public gl: WebGl,
        public buffer: WebGLBuffer,
        public position: number,
        public width: number,
        public type: number,
    ) {}

    static new(gl: WebGl, program: WebGLProgram, name: string, matrixWidth: number) {
        let position = gl.getAttribLocation(program, name);
        let buffer = gl.createBuffer()!;
        return new Attribute(gl, buffer, position, matrixWidth, gl.FLOAT);
    }

    set(gl: WebGl, data: BufferSource, speed: DrawSpeed) {
        // experiment with switching these two
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.position);
        gl.vertexAttribPointer(this.position, this.width, this.type, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, data, HelpGl.convertDrawSpeed(this.gl, speed));
    }

    preRender(gl: WebGl) {
        gl.enableVertexAttribArray(this.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(this.position, this.width, this.type, false, 0, 0);
    }
}

export class IndexAttribute {}
