// webgl-helpers.ts
//
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this
// TODO: remove all the WebGl wrappers
// TODO: incorrect terminology: this is not a Shader, this is a ShaderSet, ShaderDuo, or something like that
// still tho, within a larger context, the whole of a fragment & vertex shader can be named Shader for the time being...

import { Matrix3, Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/vector";
import { ShaderMesh } from "../mesh/shader-mesh";
import { Attribute } from "./attribute";
import { Camera } from "./camera";
import { Context } from "./context";
import { Uniform, UniformType } from "./uniform";
import { DrawSpeed, HelpGl } from "./webgl";

// import { Scene } from "./scene";

// @param T = data to feed the renderer at 'set'
export abstract class Shader<T> {
    protected gl: WebGLRenderingContext;
    protected program: WebGLProgram;
    protected uniforms: Map<string, Uniform>;
    protected attributes: Map<string, Attribute>;
    protected cycles: number; // number of times the shaders need to render

    constructor(gl: WebGLRenderingContext, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = HelpGl.createProgramFromScripts(gl, vertexScript, fragmentScript);
        this.uniforms = new Map();
        this.attributes = new Map();
        this.cycles = 0;
    }

    abstract set(r: T, speed: DrawSpeed): void;

    abstract render(context: Context): void;

    setAndRender(r: T, context: Context) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }

    setCycles(cycles: number) {
        this.cycles = cycles;
    }

    // ---------------------------------------

    newUniform(name: string, size: number, state: number[] = [], type = UniformType.Float) {
        let uniform = Uniform.new(this.gl, this.program, name, type, size, state);
        this.uniforms.set(name, uniform);
        return uniform;
    }

    /**
     * WebGl wrapping
     */
    setUniform(name: string, value: number) {
        this.getUniform(name).set([value]);
    }

    setUniform2(name: string, value: Vector2) {
        this.getUniform(name).set([value.x, value.y]);
    }

    setUniform3(name: string, value: Vector3) {
        this.getUniform(name).set([value.x, value.y, value.z]);
    }

    setUniform4(name: string, value: number[]) {
        this.getUniform(name).set(value);
    }

    setUniformMatrix3(name: string, value: Matrix3) {
        this.getUniform(name).set(value.data);
    }

    setUniformMatrix4(name: string, value: Matrix4) {
        this.getUniform(name).set(value.data);
    }

    getUniform(name: string) {
        return this.uniforms.get(name)!;
    }

    loadUniforms() {
        for (let [k, v] of this.uniforms) {
            v.load(this.gl);
        }
    }

    newAttribute(name: string, width: number) {
        this.attributes.set(name, Attribute.new(this.gl, this.program, name, width));
    }

    setAttribute(name: string, data: BufferSource, speed: DrawSpeed) {
        this.attributes.get(name)!.set(this.gl, data, speed);
    }

    loadAttributes() {
        for (let [k, v] of this.attributes) {
            v.load(this.gl);
        }
    }
}
