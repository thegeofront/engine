// shader.ts
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this

import { Attributes } from "./Attributes";
import { Uniforms } from "./Uniforms";
import { DrawSpeed, HelpGl, WebGl } from "./HelpGl";
import { DrawElementsType, DrawMethod, DrawMode, INDEX_BUFFER_NAME } from "./Constants";
import { Scene } from "../../lib";

/**
 * An implementation of 'program' needs to define 4 methods:
 * @param T = data to feed the renderer at 'load'
 * 1. `constructor`
 *    - state the vertex & fragment shader
 *    - call super
 *
 * 2. `onInit`
 *    - init all attributes
 *    - init all uniforms, state which ones should be exposed publicly
 *    - return the 'DrawMode' which needs to be used to draw this shader
 *
 * 2. `onLoad`
 *    - explain how 'T' set the main attributes
 *    - return a number representing how many 'drawmode' features need to be drawn
 *
 * 3. `onRender`
 *    - explain how 'Context' needs to be loaded into this shader
 */
export abstract class ShaderProgram<T> {
    protected gl: WebGl;
    protected program: WebGLProgram;

    protected uniforms!: Uniforms;
    protected attributes!: Attributes;

    // auto set
    private drawElementsOrArrays = () => {};
    private method = DrawMethod.Arrays;

    private mode = DrawMode.Triangles;
    private drawCount = 0; // number of times the shaders need to render
    protected drawOffset = 0;

    constructor(gl: WebGl, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = HelpGl.createProgramFromScripts(gl, vertexScript, fragmentScript);
        this.init();
    }

    init() {
        this.useProgram();
        this.uniforms = new Uniforms(this.gl, this.program);
        this.attributes = new Attributes(this.gl, this.program);
        this.drawCount = 0;
        this.mode = this.onInit();
        this.setDrawMethod();
    }

    load(r: T, speed = DrawSpeed.StaticDraw) {
        this.useProgram();
        this.drawCount = this.onLoad(r, speed);
    }

    draw(c: Scene) {
        this.useProgram();
        this.onDraw(c);
        this.uniforms.bindAll();
        this.attributes.bindAll();
        this.drawElementsOrArrays();
    }

    loadAndDraw(r: T, context: Scene) {
        this.load(r, DrawSpeed.DynamicDraw);
        this.draw(context);
    }

    // ------------ These three methods need to be overwritten -------------------

    protected abstract onInit(): DrawMode;

    protected abstract onLoad(data: T, speed: DrawSpeed): number;

    protected abstract onDraw(c: Scene): void;

    // ---------------------------------------------------------------------------
    
    protected useProgram() {
        this.gl.useProgram(this.program);
    }

    // ---------------------------------------------------------------------------

    private setDrawMethod() {
        if (this.attributes.has(INDEX_BUFFER_NAME)) {
            this.method = DrawMethod.Elements;
            this.drawElementsOrArrays = this.drawElements;
        } else {
            this.method = DrawMethod.Arrays;
            this.drawElementsOrArrays = this.drawArrays;
        }
    }

    private drawElements() {
        this.gl.drawElements(this.mode, this.drawCount, this.attributes.indexAttributeElementType!, this.drawOffset);
    }

    private drawArrays() {
        this.gl.drawArrays(this.mode, this.drawOffset, this.drawCount);
    }
}
