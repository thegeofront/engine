import { Attribute } from "./attribute";
import { DrawSpeed, WebGl } from "./webgl";

/**
 * all attributes corresponding to one GL program.
 */
export class Attributes {
    constructor(
        private gl: WebGl,
        private program: WebGLProgram,
        private attributes: Map<string, Attribute> = new Map(),
    ) {}

    add(name: string, width: number) {
        this.attributes.set(name, Attribute.new(this.gl, this.program, name, width));
    }

    set(name: string, data: BufferSource, speed: DrawSpeed) {
        this.attributes.get(name)!.set(this.gl, data, speed);
    }

    /**
     * Load the state of all attributes, to prepare for rendering
     */
    loadAll() {
        for (let [k, v] of this.attributes) {
            v.load(this.gl);
        }
    }
}
