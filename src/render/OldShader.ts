// shader.ts
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this
// TODO: incorrect terminology: this is not a Shader, this is a ShaderSet, ShaderDuo, or something like that
// still tho, within a larger context, the whole of a fragment & vertex shader can be named Shader for the time being...
// This is old, not needed anymore

import { Attributes } from "./webgl/Attributes";
import { Uniforms } from "./webgl/Uniforms";
import { DrawSpeed, HelpGl, WebGl } from "./webgl/HelpGl";
import { DrawElementsType, DrawMethod, DrawMode, INDEX_BUFFER_NAME } from "./webgl/Constants";
import { Scene } from "../lib";

/**
 * An implementation of 'Shader' needs to define 3 methods:
 *
 * 1. `constructor`
 *    - state the vertex & fragment shader
 *    - init all uniforms, state which ones should be exposed publicly (TODO could be automated...)
 *    - init all attributes (TODO could be automated...)
 * 2. `Set`
 *    - explain how 'T' set the attributes
 *    - give a number to 'this.drawCount'
 * 3. `Render`
 *    - explain how 'Context' needs to be loaded into this shader
 *    - call 'loadAll()' on both attributes & uniforms
 *    - render using either 'DrawArrays()' or 'DrawElements()' (TODO could get some more automation)
 */
// @param T = data to feed the renderer at 'set'
export abstract class OldShader<T> {
    protected gl: WebGl;
    protected program: WebGLProgram;

    protected uniforms: Uniforms;
    protected attributes: Attributes;

    protected active = true;

    // auto set
    protected draw = () => {};
    protected method = DrawMethod.Arrays;
    protected elementType?: DrawElementsType;

    protected mode = DrawMode.Triangles;
    protected drawCount = 0; // number of times the shaders need to render
    protected drawOffset = 0;

    constructor(gl: WebGl, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = HelpGl.createProgramFromScripts(gl, vertexScript, fragmentScript);
        this.uniforms = new Uniforms(this.gl, this.program);
        this.attributes = new Attributes(this.gl, this.program);
        this.drawCount = 0;
        gl.useProgram(this.program);
    }

    // TODO refactor to 'onSet()'
    abstract set(r: T, speed: DrawSpeed): void;

    // TODO refactor to 'onRender()'
    abstract render(context: Scene): void;

    setAndRender(r: T, context: Scene) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }

    setDrawCount(drawCount: number) {
        this.drawCount = drawCount;
    }
}
