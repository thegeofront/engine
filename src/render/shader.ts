// webgl-helpers.ts
//
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this
// TODO: remove all the WebGl wrappers

import { ShaderMesh } from "../mesh/shader-mesh";
import { Camera } from "./camera";
import { Context } from "./context";
import { DrawSpeed, HelpGl } from "./webgl";

// import { Scene } from "./scene";

// @param T = data to feed the renderer at 'set'
export abstract class Shader<T> {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    constructor(gl: WebGLRenderingContext, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = HelpGl.createProgramFromScripts(gl, vertexScript, fragmentScript);
    }

    abstract set(r: T, speed: DrawSpeed): void;

    abstract render(context: Context): void;

    setAndRender(r: T, context: Context) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }

    // helpers. these could live somewhere else... maybe in Context?
    //#region

    //#endregion
}
