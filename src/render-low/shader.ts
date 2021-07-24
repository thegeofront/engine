// shader.ts
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this
// TODO: incorrect terminology: this is not a Shader, this is a ShaderSet, ShaderDuo, or something like that
// still tho, within a larger context, the whole of a fragment & vertex shader can be named Shader for the time being...

import { Attributes } from "./attributes";
import { Context } from "../render/context";
import { Uniforms } from "./uniforms";
import { DrawSpeed, HelpGl, WebGl } from "./webgl";
import { DrawElementsType, DrawMethod, DrawMode, IndexBufferName } from "./constants";

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
export abstract class Shader<T> {
    protected gl: WebGl;
    protected program: WebGLProgram;

    protected uniforms: Uniforms;
    protected attributes: Attributes;

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
    abstract render(context: Context): void;

    setAndRender(r: T, context: Context) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }

    setDrawCount(drawCount: number) {
        this.drawCount = drawCount;
    }

    // -------------------------------------------------------------

    onInit(): DrawMode {
        return DrawMode.Triangles;
    }

    onSet(r: T, speed: DrawSpeed): number {
        return 0;
    }

    onRender(c: Context): void {
        return;
    }

    protected _init() {
        this.mode = this.onInit();
        this.setDrawMethod();
    }

    protected _set(r: T, speed: DrawSpeed) {
        this.gl.useProgram(this.program);
        this.drawCount = this.onSet(r, speed);
    }

    protected _render(c: Context) {
        this.gl.useProgram(this.program);
        this.onRender(c);
        this.uniforms.loadAll();
        this.attributes.loadAll();
        this.draw();
    }

    // should be called after 'set'
    setDrawMethod() {
        if (this.attributes.has(IndexBufferName)) {
            this.method = DrawMethod.Elements;
            this.draw = this.drawElements;
        } else {
            this.method = DrawMethod.Arrays;
            this.draw = this.drawArrays;
        }
    }

    private drawElements() {
        this.gl.drawElements(this.mode, this.drawCount, this.elementType!, this.drawOffset);
    }

    private drawArrays() {
        this.gl.drawArrays(this.mode, this.drawOffset, this.drawCount);
    }
}
