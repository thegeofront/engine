
export class WebglHelpers {
    
    static initWebglContext(canvas: HTMLCanvasElement) {

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
}


