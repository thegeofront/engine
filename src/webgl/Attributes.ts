import { Attribute } from "./Attribute";
import { DrawElementsType, INDEX_BUFFER_NAME } from "./Constants";
import { DrawSpeed, WebGl } from "./HelpGl";
import { IndexAttribute } from "./IndexAttribute";

/**
 * all attributes corresponding to one GL program.
 */
export class Attributes {
    constructor(
        private gl: WebGl,
        private program: WebGLProgram,
        private attributes: Map<string, Attribute | IndexAttribute> = new Map(),
    ) {}

    add(name: string, width: number) {
        this.attributes.set(name, Attribute.new(this.gl, this.program, name, width));
    }

    has(name: string) {
        return this.attributes.has(name);
    }

    addIndex(type: DrawElementsType) {
        this.attributes.set(INDEX_BUFFER_NAME, IndexAttribute.new(this.gl, type));
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
