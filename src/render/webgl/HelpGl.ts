// purpose : webgl wrapping & helper functions

import { Texture } from "../../image/Texture";

var nextTextureId = 0;
var rendercallsperframe = 0;

export type WebGl = WebGLRenderingContext;

// TODO move this to 'constants.ts' and refactor everything again :)
export enum DrawSpeed {
    StreamDraw = 0x88e0,
    StaticDraw = 0x88e4, // if you plan on using the 'set' method only a couple of times / once
    DynamicDraw = 0x88e8, // if you plan on using the 'set' method every frame
}

export class HelpGl {

    /**
     * We need to keep track of all textures in the entire webgl application
     */
    static getNextTextureID() {
        let id = nextTextureId;
        nextTextureId += 1;
        return id;
    }

    static resizeCanvas(gl: WebGl) {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        let canvas = gl.canvas as HTMLCanvasElement;

        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        const needResize = gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight;

        if (needResize) {
            // Make the canvas the same size
            gl.canvas.width = displayWidth;
            gl.canvas.height = displayHeight;
        }

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        return needResize;
    }

    static initWebglContext(canvas: HTMLCanvasElement, blend = false): WebGl | undefined {
        let possiblyGl = canvas.getContext("webgl");
        if (possiblyGl == undefined) {
            alert("webgl unavailable...");
            return undefined;
        }

        let gl = possiblyGl!;
        gl.enable(gl.CULL_FACE);

        if (blend) {
            gl.enable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        } else {
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }

        // extensions
        let ext = gl.getExtension("OES_element_index_uint");

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1);

        return gl;
    }

    static compileShader(gl: WebGl, shaderSource: string, shaderType: number): WebGLShader {
        let shader = gl.createShader(shaderType)!;
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            throw "could not compile shader:" + shaderSource + gl.getShaderInfoLog(shader);
        }
        return shader;
    }

    static createProgram(gl: WebGl, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        let program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw "program failed to link:" + gl.getProgramInfoLog(program);
        }
        return program;
    }

    static createProgramFromScripts(
        gl: WebGl,
        vertexScript: string,
        fragmentScript: string,
    ): WebGLProgram {
        let vertexShader = HelpGl.compileShader(gl, vertexScript, gl.VERTEX_SHADER);
        let fragmentShader = HelpGl.compileShader(gl, fragmentScript, gl.FRAGMENT_SHADER);
        return HelpGl.createProgram(gl, vertexShader, fragmentShader);
    }

    /**
     * WebGl only allows textures with a width and height of the power of two.
     * This means `32x512` is valid, while `40x40` is not valid
     * This function takes a size, lets say `40`, and rounds up to the nearest power of two, in this case `64`
     */
    static getNearestCorrectTextureSize(size: number) {
        let base = Math.log2(size);
        return Math.pow(2, Math.ceil(base));
    }

    static fixTextureSizing(image: Texture) : Texture {
        let goodWidth = HelpGl.getNearestCorrectTextureSize(image.width);
        let goodHeight = HelpGl.getNearestCorrectTextureSize(image.height);
        if (goodWidth !== image.width || goodHeight !== image.height) {
            // we need to perform resizing!
            console.log("resizing to ", goodWidth, goodHeight);
            let u = image.width / goodWidth;
            let v = image.height / goodHeight;
            return image.buffer(goodWidth, goodHeight);;
        }
        return image;
    }
}
