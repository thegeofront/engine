// webgl-helpers.ts
// 
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/
// note: im still figuring out how to organize this 

export class Renderer {

    gl: WebGLRenderingContext;
    program: WebGLProgram;

    constructor(gl: WebGLRenderingContext, vertexScript: string, fragmentScript: string) {
        this.gl = gl;
        this.program = createProgramFromScripts(gl, vertexScript, fragmentScript);
    }

    static resizeCanvas(gl: WebGLRenderingContext) {

        // Lookup the size the browser is displaying the canvas in CSS pixels.
        let canvas = gl.canvas as HTMLCanvasElement;

        const displayWidth  = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
       
        // Check if the canvas is not the same size.
        const needResize = gl.canvas.width  !== displayWidth ||
                           gl.canvas.height !== displayHeight;
       
        if (needResize) {
          // Make the canvas the same size
          gl.canvas.width  = displayWidth;
          gl.canvas.height = displayHeight;
        }
       
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        return needResize;
    }
    
    convertDrawSpeed(speed: DrawSpeed) : number {
        if (speed == DrawSpeed.DynamicDraw) {
            return this.gl.DYNAMIC_DRAW;
        } else {
            return this.gl.STATIC_DRAW;
        }
    }
    
}

export function initWebglContext(canvas: HTMLCanvasElement) {

    let possiblyGl = canvas.getContext("webgl");
    if (possiblyGl == undefined)
    {
        console.log("webgl unavailable...");
    }
    let gl = possiblyGl!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.);

    return gl;
}

// 
export enum DrawSpeed {
    StaticDraw,  // if you plan on using the 'set' method only a couple of times / once
    DynamicDraw // if you plan on using the 'set' method every frame 
}



// the setup of a program containing 2 shader scripts

function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) : WebGLShader {
    
    var shader = gl.createShader(shaderType)!; 
    gl.shaderSource(shader, shaderSource); 
    gl.compileShader(shader); 
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); 
    if (!success) {
        throw "could not compile shader:" + shaderSource + gl.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {

    var program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program failed to link:" + gl.getProgramInfoLog (program));
    }   
    return program;
};

function createProgramFromScripts(gl: WebGLRenderingContext, vertexScript: string, fragmentScript: string): WebGLProgram {
    var vertexShader = compileShader(gl, vertexScript, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentScript, gl.FRAGMENT_SHADER);
    return createProgram(gl, vertexShader, fragmentShader);
}