// name:    image-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of images / textures

import { Rectangle2 } from "../geo/rectangle";
import { DrawSpeed, Renderer } from "./renderer";



// NOTE: DEPRICATED / NOT WORKING PROPERLY
// export class ImageRenderer extends Renderer {

//     texture_id: number;

//     // attribute & uniform locations
//     a_verts: number;
//     a_verts_buffer: WebGLBuffer;
//     u_resolution: WebGLUniformLocation;
//     u_color: WebGLUniformLocation;

//     texture: WebGLTexture;
//     u_texture: WebGLUniformLocation;
//     a_uvs: number;
//     a_uvs_buffer: WebGLBuffer | null;

//     constructor(gl: WebGLRenderingContext) {

//         // note: I like vertex & fragments to be included in the script itself.
//         // when you change vertex or fragment, this class has to deal with it. 
//         // putting them somewhere else doesnt make sense to me, 
//         // they are coupled 1 to 1.
//         let vertexSource: string = `
//         attribute vec2 a_position;
//         attribute vec2 a_texCoord;

//         uniform vec2 u_resolution;

//         varying vec2 v_texCoord;

//         void main() {
//             // convert the rectangle from pixels to 0.0 to 1.0
//             vec2 zeroToOne = ((a_position / u_resolution) * 2.0) - 1.0;

//             gl_Position = vec4(zeroToOne * vec2(1, -1), 0, 1);

//             v_texCoord = a_texCoord;
//         }
//         `;
//         let fragmentSource: string = `
//         precision mediump float;
 
//         uniform sampler2D u_texture;

//         varying vec2 v_texCoord;
        
//         void main() {
//             // Look up a color from the texture.
//             gl_FragColor = texture2D(u_texture, v_texCoord);
//         }
//         `;

//         // setup program
//         super(gl, vertexSource, fragmentSource);

//         // init uniforms
//         this.u_texture =  gl.getUniformLocation(this.program, "u_texture")!;
//         this.u_resolution = gl.getUniformLocation(this.program, "u_resolution")!;
//         this.u_color = gl.getUniformLocation(this.program, "u_color")!;

//         // verts buffer
//         this.a_verts = gl.getAttribLocation(this.program, "a_position");
//         this.a_verts_buffer = gl.createBuffer()!;

//         // uvs buffer
//         this.a_uvs = gl.getAttribLocation(this.program, "a_texCoord");
//         this.a_uvs_buffer = gl.createBuffer();
   
//         // Create a texture.
//         this.texture = gl.createTexture()!;
//         this.texture_id = Renderer.getNextTextureID();
//     }

//     set(r: Rectangle2, image: ImageData, speed: DrawSpeed) {
        
//         let gl = this.gl;
//         let drawspeed = super.convertDrawSpeed(speed);
//         gl.useProgram(this.program);

//         // set uniforms
//         gl.uniform2f(this.u_resolution, gl.canvas.width, gl.canvas.height);
    
//         // enable the texture 
//         gl.uniform1i(this.u_texture, this.texture_id);
//         gl.activeTexture(gl.TEXTURE0 + this.texture_id);
//         gl.bindTexture(gl.TEXTURE_2D, this.texture);

//         // fill the texture
//         // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 128, 128, 255]));
//         // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture.data);

//         // Set the parameters so we can render any size image.
//         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//         // enable UVs
//         gl.enableVertexAttribArray(this.a_uvs);
//         gl.vertexAttribPointer(this.a_uvs, 2, gl.FLOAT, false, 0, 0);
//         gl.bindBuffer(gl.ARRAY_BUFFER, this.a_uvs_buffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//             0.0,  0.0,
//             1.0,  0.0,
//             0.0,  1.0,
//             0.0,  1.0,
//             1.0,  0.0,
//             1.0,  1.0]), drawspeed);

//         // enable & set verts
//         gl.enableVertexAttribArray(this.a_verts);
//         var size = 2;          // 2 components per iteration
//         var type = gl.FLOAT;   // the data is 32bit floats
//         var normalize = false; // don't normalize the data
//         var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
//         var offset = 0;        // start at the beginning of the buffer
//         gl.vertexAttribPointer(this.a_verts, size, type, false, 0, 0);
//         gl.bindBuffer(gl.ARRAY_BUFFER, this.a_verts_buffer);
//         let verts = r.getVertices();
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//             verts[0].x, verts[0].y,
//             verts[1].x, verts[1].y,
//             verts[2].x, verts[2].y,
//             verts[2].x, verts[2].y,
//             verts[1].x, verts[1].y,
//             verts[3].x, verts[3].y,
//         ]), drawspeed);
//     }

//     render() {
 
//         // use the program
//         let gl = this.gl;
//         gl.useProgram(this.program);
        
//         // set uniforms
//         gl.uniform1i(this.u_texture, this.texture_id);

//         // set texture 
//         gl.activeTexture(gl.TEXTURE0 + this.texture_id);
//         gl.bindTexture(gl.TEXTURE_2D, this.texture);

//         // buffer verts
//         gl.enableVertexAttribArray(this.a_verts);
//         gl.bindBuffer(gl.ARRAY_BUFFER, this.a_verts_buffer);
//         gl.vertexAttribPointer(this.a_verts, 2, gl.FLOAT, false, 0, 0);

//         // buffer uvs
//         gl.enableVertexAttribArray(this.a_uvs);
//         gl.bindBuffer(gl.ARRAY_BUFFER, this.a_uvs_buffer);
//         gl.vertexAttribPointer(this.a_uvs, 2, gl.FLOAT, false, 0, 0);

//         // draw!
//         gl.drawArrays(gl.TRIANGLES, 0, 6);
//     }

//     // render 1 image to the screen
//     setAndRender(gl: WebGLRenderingContext, r: Rectangle2, image: ImageData) {
//         this.set(r, image, DrawSpeed.DynamicDraw);
//         this.render();
//     }

//     randomInt(range: number) : number {
//         return Math.floor(Math.random() * range);
//     }
// }