// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../data/line-array";
import { Vector3Array } from "../data/vector-array";
import { DisplayMesh } from "../geo/mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { SimpleLineRenderer } from "./simple-line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";

export class TextureMeshRenderer extends Renderer {
    
    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;
    index_buffer: WebGLBuffer;

    u_transform: WebGLUniformLocation;
    // u_texture: WebGLUniformLocation;

    count: number;
    size: number;
    a_texcoord: number;
    a_texcoord_buffer: WebGLBuffer;
    u_texture: WebGLUniformLocation;
    texture_id: number;
    texture: WebGLTexture | null;

    constructor(gl: WebGLRenderingContext) {
        const vs = `
        // precision mediump int;
        // precision mediump float;

        attribute vec4 a_position;
        attribute vec2 a_texcoord;

        uniform mat4 u_transform;

        varying vec2 v_texcoord;

        void main() {
            gl_Position = u_transform * a_position;
            v_texcoord = a_texcoord;
        }
        `;

        const fs = `
        precision mediump float;

        varying vec2 v_texcoord;

        uniform sampler2D u_texture;

        void main() {
            gl_FragColor = texture2D(u_texture, v_texcoord);
        }
        `;

        // setup program    
        super(gl, vs, fs);
        gl.useProgram(this.program);
        this.count = 0;
        this.size = 0;

        // init uniforms 
        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.u_texture = gl.getUniformLocation(this.program, "u_texture")!;

        // init three buffers: verts | uvs | links
        this.a_position = gl.getAttribLocation(this.program, "a_position");
        this.a_position_buffer = gl.createBuffer()!;

        this.a_texcoord = gl.getAttribLocation(this.program, "a_texcoord");
        this.a_texcoord_buffer = gl.createBuffer()!;

        this.index_buffer = gl.createBuffer()!; 

        // init texture
        this.texture_id = Renderer.getNextTextureID();
        this.texture = gl.createTexture();
    }

    setAndRender(gl: WebGLRenderingContext, matrix: Matrix4, mesh: DisplayMesh) {
        this.set(gl, mesh, DrawSpeed.DynamicDraw);
        this.render(gl, matrix);
    }

    set(gl: WebGLRenderingContext, mesh: DisplayMesh, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        
        if (!mesh.texture) {
            console.warn("Mesh does not contain a texture!");
            return;
        }

        // save how many faces need to be drawn
        gl.useProgram(this.program);
        this.count = mesh.faces.data.length

        // buffer 1
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.verts.data, this.convertDrawSpeed(speed));

        // buffer 2 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_texcoord_buffer);
        gl.vertexAttribPointer(this.a_texcoord, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs.data, this.convertDrawSpeed(speed));

        // buffer 3
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.faces.data), this.convertDrawSpeed(speed));

        // texture 
        gl.activeTexture(gl.TEXTURE0 + this.texture_id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture);
        // alternative texture -> Fill the texture with a 1x1 blue pixel.
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 128, 128, 255]));
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, mesh.texture.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, matrix: Matrix4) {
        
        // console.log("rendering..");

        // use the program
        gl.useProgram(this.program);
        
        // set uniforms
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);
        
        // set texture 
        gl.uniform1i(this.u_texture, this.texture_id);
        gl.activeTexture(gl.TEXTURE0 + this.texture_id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // buffer 1
        gl.enableVertexAttribArray(this.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);

        // buffer 2
        gl.enableVertexAttribArray(this.a_texcoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_texcoord_buffer);
        gl.vertexAttribPointer(this.a_texcoord, 2, gl.FLOAT, false, 0, 0);

        // buffer 3
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        
        // draw!
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}