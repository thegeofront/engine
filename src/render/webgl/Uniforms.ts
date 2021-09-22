import { GeonImage } from "../../image/Image";
import { Matrix4 } from "../../math/Matrix4";
import { Vector2 } from "../../math/Vector2";
import { Uniform, UniformTexture, UniformType } from "./Uniform";
import { WebGl } from "./HelpGl";
import { Vector3 } from "../../math/Vector3";
import { Matrix3 } from "../../math/Matrix3";

/**
 * all uniforms corresponding to one GL program.
 */
export class Uniforms {
    constructor(
        private gl: WebGl,
        private program: WebGLProgram,
        private uniforms: Map<string, Uniform> = new Map(),
        private textures: Map<string, UniformTexture> = new Map(),
    ) {}

    add(name: string, size: number, defaultState: Iterable<number> = [], type = UniformType.Float) {
        let uniform = Uniform.new(this.gl, this.program, name, type, size, defaultState);
        this.uniforms.set(name, uniform);
        return uniform;
    }

    addTexture(name: string) {
        let texture = UniformTexture.new(this.gl, this.program, name);
        this.textures.set(name, texture);
        return texture;
    }

    get(name: string) {
        return this.uniforms.get(name)!;
    }
    
    
    /**
     * Load the state of all uniforms, to prepare for rendering
     */
     bindAll() {
        for (let v of this.uniforms.values()) {
            v.bind(this.gl);
        }
        for (let v of this.textures.values()) {
            v.bind(this.gl);
        }
    }

    loadTexture(name: string, source: GeonImage) {
        this.textures.get(name)!.load(source.toImageData());
    }

    loadTextureSource(name: string, source: TexImageSource) {
        this.textures.get(name)!.load(source);
    }

    load(name: string, value: number) {
        this.get(name).load([value]);
    }

    load2(name: string, value: Vector2) {
        this.get(name).load([value.x, value.y]);
    }

    load3(name: string, value: Vector3) {
        this.get(name).load([value.x, value.y, value.z]);
    }

    load4(name: string, value: number[]) {
        this.get(name).load(value);
    }

    loadMatrix3(name: string, value: Matrix3) {
        this.get(name).load(value.data);
    }

    loadMatrix4(name: string, value: Matrix4) {
        this.get(name).load(value.data);
    }
}
