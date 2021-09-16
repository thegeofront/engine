import { GeonImage } from "../img/Image";
import { Matrix3, Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";
import { Uniform, UniformTexture, UniformType } from "./uniform";
import { WebGl } from "./webgl";

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

    add(name: string, size: number, state: number[] = [], type = UniformType.Float) {
        let uniform = Uniform.new(this.gl, this.program, name, type, size, state);
        this.uniforms.set(name, uniform);
        return uniform;
    }

    addTexture(name: string) {
        let texture = UniformTexture.new(this.gl, this.program, name);
        this.textures.set(name, texture);
        return texture;
    }

    setTexture(name: string, source: GeonImage) {
        this.textures.get(name)!.set(source.toImageData());
    }

    setTextureSource(name: string, source: TexImageSource) {
        this.textures.get(name)!.set(source);
    }

    set(name: string, value: number) {
        this.get(name).set([value]);
    }

    set2(name: string, value: Vector2) {
        this.get(name).set([value.x, value.y]);
    }

    set3(name: string, value: Vector3) {
        this.get(name).set([value.x, value.y, value.z]);
    }

    set4(name: string, value: number[]) {
        this.get(name).set(value);
    }

    setMatrix3(name: string, value: Matrix3) {
        this.get(name).set(value.data);
    }

    setMatrix4(name: string, value: Matrix4) {
        this.get(name).set(value.data);
    }

    get(name: string) {
        return this.uniforms.get(name)!;
    }

    /**
     * Load the state of all uniforms, to prepare for rendering
     */
    loadAll() {
        for (let v of this.uniforms.values()) {
            v.load(this.gl);
        }
        for (let v of this.textures.values()) {
            v.load(this.gl);
        }
    }
}
