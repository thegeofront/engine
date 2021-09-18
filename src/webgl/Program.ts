// shader.ts
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this
// TODO: incorrect terminology: this is not a Shader, this is a ShaderSet, ShaderDuo, or something like that
// still tho, within a larger context, the whole of a fragment & vertex shader can be named Shader for the time being...

import { Attributes } from "./Attributes";
import { Context } from "../render/Context";
import { Uniforms } from "./Uniforms";
import { DrawSpeed, HelpGl, WebGl } from "./HelpGl";
import { DrawElementsType, DrawMethod, DrawMode, INDEX_BUFFER_NAME } from "./Constants";

/**
 * An implementation of 'program' needs to define 4 methods:
 * @param T = data to feed the renderer at 'set'
 * 1. `constructor`
 *    - state the vertex & fragment shader
 *    - init all uniforms, state which ones should be exposed publicly
 *    - explain how 'S' set the uniforms, possibly
 *    - DO NOT INIT ATTRIBUTES IN HERE
 *
 * 2. `onInit`
 *    - init all attributes
 *    - return the 'DrawMode' which needs to be used to draw this shader
 *
 * 2. `onSet`
 *    - explain how 'T' set the attributes
 *    - return a number representing how many 'drawmode' features need to be drawn
 *
 * 3. `onRender`
 *    - explain how 'Context' needs to be loaded into this shader
 *    - call 'loadAll()' on both attributes & uniforms
 *    - render using either 'DrawArrays()' or 'DrawElements()' (TODO could get some more automation)
 */
export abstract class Program<T> {
    protected gl: WebGl;
    protected program: WebGLProgram;

    protected uniforms!: Uniforms;
    protected attributes!: Attributes;

    protected active = true;

    // auto set
    private draw = () => {};
    private method = DrawMethod.Arrays;
    private elementType?: DrawElementsType;

    private mode = DrawMode.Triangles;
    private drawCount = 0; // number of times the shaders need to render
    protected drawOffset = 0;

    constructor(gl: WebGl, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = HelpGl.createProgramFromScripts(gl, vertexScript, fragmentScript);
        this.init();
    }

    init(settings?: any) {
        this.gl.useProgram(this.program);
        this.uniforms = new Uniforms(this.gl, this.program);
        this.attributes = new Attributes(this.gl, this.program);
        this.drawCount = 0;
        this.mode = this.onInit(settings);
        this.setDrawMethod();
    }

    set(r: T, speed: DrawSpeed) {
        this.gl.useProgram(this.program);
        this.drawCount = this.onSet(r, speed);
    }

    render(c: Context) {
        // if (!this.active) {
        //     return;
        // }
        this.gl.useProgram(this.program);
        this.onRender(c);
        this.uniforms.loadAll();
        this.attributes.loadAll();
        this.draw();
    }

    setAndRender(r: T, context: Context) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }

    // pauze() {
    //     this.active = false;
    // }

    // resume() {
    //     this.active = true;
    // }

    // ------------ These three methods need to be overwritten -------------------

    protected abstract onInit(settings?: any): DrawMode;

    protected abstract onSet(data: T, speed: DrawSpeed): number;

    protected abstract onRender(c: Context): void;

    // ---------------------------------------------------------------------------

    private setDrawMethod() {
        if (this.attributes.has(INDEX_BUFFER_NAME)) {
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
