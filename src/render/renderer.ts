// webgl-helpers.ts
// 
// author: Jos Feenstra
// credits to : https://webglfundamentals.org/

export class Renderer {
    
    program: WebGLProgram;

    constructor(gl: WebGLRenderingContext, vertexScript: string, fragmentScript: string) {
        this.program = createProgramFromScripts(gl, vertexScript, fragmentScript);
    }

    setState() {}

    render() {}
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

// the setup of a program containing 2 shader scripts

function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) : WebGLShader {
    
    var shader = gl.createShader(shaderType)!; 
    gl.shaderSource(shader, shaderSource); 
    gl.compileShader(shader); 
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); 
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
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