import { HelpGl, WebGl } from "./HelpGl";

/**
 * This represent a draw target. when 'gl.drawElements' or 'gl.drawArrays' is called when this is bound, 
 * the result of the render will be stored within the texture and depth buffer 
 */
export class DrawTarget {
    
    private constructor(
        public width: number,
        public height: number,
        public texture: WebGLTexture,
        public depthBuffer: WebGLRenderbuffer,
        public frameBuffer: WebGLFramebuffer,
    ) {}

    /**
     * Creation automatically binds it
     */
    static createAndBind(gl: WebGl, width: number, height: number) {

        // create to render to
        const targetTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
            
        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);
        
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Create and bind the framebuffer
        const frameBuffer = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.viewport(0, 0, width, height);

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
        
        // create a depth renderbuffer
        const depthBuffer = gl.createRenderbuffer()!;
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            
        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        
        return new DrawTarget(width, height, targetTexture, depthBuffer, frameBuffer);
    }

    bind(gl: WebGl) {
        HelpGl.setDrawTarget(gl, this.frameBuffer, this.width, this.height);
    }

    unbind(gl: WebGl) {
        HelpGl.resetDrawTarget(gl);
    }
}

