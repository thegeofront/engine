// name:    image-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of images / textures

import { Rectangle2 } from "../geo/rectangle";
import { Renderer } from "./renderer";

export class ImageRenderer extends Renderer {

    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;
    u_resolution: WebGLUniformLocation;
    u_color: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext) {

        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it. 
        // putting them somewhere else doesnt make sense to me, 
        // they are coupled 1 to 1.
        let vertexSource: string = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main() {
            // convert the rectangle from pixels to 0.0 to 1.0
            vec2 zeroToOne = ((a_position / u_resolution) * 2.0) - 1.0;

            gl_Position = vec4(zeroToOne * vec2(1, -1), 0, 1);

            v_texCoord = a_texCoord;
        }
        `;
        let fragmentSource: string = `
        precision mediump float;
 
        uniform sampler2D u_image;

        varying vec2 v_texCoord;
        
        void main() {
            // Look up a color from the texture.
            gl_FragColor = texture2D(u_image, v_texCoord);
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);

        // look up where the vertex data needs to go.
        this.a_position = gl.getAttribLocation(this.program, "a_position");
        this.a_position_buffer = gl.createBuffer()!;
        this.u_resolution = gl.getUniformLocation(this.program, "u_resolution")!;
        this.u_color = gl.getUniformLocation(this.program, "u_color")!;

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);     
        
        // look up where the texture coordinates need to go.
        var a_texCoord = gl.getAttribLocation(this.program, "a_texCoord");
        
        // provide texture coordinates for the rectangle.
        var a_texCoord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, a_texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(a_texCoord);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 0, 0);
        
        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, r: Rectangle2, image: ImageData) {

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Turn on the attribute
        gl.enableVertexAttribArray(this.a_position);

        gl.uniform2f(this.u_resolution, gl.canvas.width, gl.canvas.height);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(this.a_position, size, type, normalize, stride, offset);

        this.setRectangle(gl, r);

        // Set a random color.
        gl.uniform4f(this.u_color, Math.random(), Math.random(), Math.random(), 1);

        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    // Fill the buffer with the values that define a rectangle.
    setRectangle(gl: WebGLRenderingContext, r: Rectangle2) {
        let verts = r.getVertices();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        verts[0].x, verts[0].y,
        verts[1].x, verts[1].y,
        verts[2].x, verts[2].y,
        verts[2].x, verts[2].y,
        verts[1].x, verts[1].y,
        verts[3].x, verts[3].y,
        ]), gl.STATIC_DRAW);
    }

    randomInt(range: number) : number {
        return Math.floor(Math.random() * range);
    }
}