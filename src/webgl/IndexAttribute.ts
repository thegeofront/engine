import { DrawElementsType } from "./Constants";
import { WebGl, DrawSpeed } from "./HelpGl";

/**
 * Wrapper for a webgl index buffer
 */
 export class IndexAttribute {
    private constructor(
        public gl: WebGl,
        public buffer: WebGLBuffer,
        public type: DrawElementsType,
    ) {}

    static new(gl: WebGl, type: DrawElementsType) {
        let buffer = gl.createBuffer()!;
        return new IndexAttribute(gl, buffer, type);
    }

    set(gl: WebGl, data: BufferSource, speed: DrawSpeed) {
        // experiment with switching these two
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, speed);
    }

    load(gl: WebGl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
}
