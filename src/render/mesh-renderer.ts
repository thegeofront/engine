// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { IntMatrix } from "../data/int-matrix";
import { Vector3Array } from "../data/vector-array";
import { Matrix4 } from "../math/matrix";
import { Renderer } from "./renderer";

export class MeshRenderer extends Renderer {

    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;
    index_buffer: WebGLBuffer;
    u_transform: WebGLUniformLocation;
    u_color: WebGLUniformLocation;
    count: number

    constructor(gl: WebGLRenderingContext, color = [1,0,0,0.25]) {

        const vs = `
        precision mediump int;
        precision mediump float;

        attribute vec4 a_position;
        // attribute vec3 a_normal;

        uniform mat4 u_transform;
        uniform vec4 u_color;

        // uniform mat4 u_projection;
        // uniform mat4 u_view;
        // uniform mat4 u_world;

        // varying vec3 v_normal;

        void main() {
            gl_Position = u_transform * a_position;
            
            // gl_Position = u_projection * u_view * u_world * a_position;
            
            // v_normal = mat3(u_world) * a_normal;
        }
        `;

        const fs = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        // varying vec3 v_normal;

        // uniform vec4 u_diffuse;
        // uniform vec3 u_lightDirection;

        void main () {
            // vec3 normal = normalize(v_normal);
            // float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
            // gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
            gl_FragColor = u_color;
        }
        `;

        // setup program    
        super(gl, vs, fs);

        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.u_color = gl.getUniformLocation(this.program, "u_color")!;
        gl.useProgram(this.program);
        gl.uniform4f(this.u_color, color[0], color[1], color[2], color[3]);
        this.count = 0;
        
        // we need 2 buffers 
        // -> 1 float buffer for the positions of all vertices.
        // -> 1 int buffer for the index of all triangles
        this.a_position = gl.getAttribLocation(this.program, "a_position");
        this.a_position_buffer = gl.createBuffer()!;
        this.index_buffer = gl.createBuffer()!;  
    }

    set(gl: WebGLRenderingContext, verts: Vector3Array, faces: IntMatrix) {
        
        // save how many faces need to be drawn
        gl.useProgram(this.program);
        this.count = faces.data.length

        // vertices 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        var size = 3;
        var type = gl.FLOAT;
        var normalize = false; 
        gl.vertexAttribPointer(this.a_position, size, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, verts.data, gl.STATIC_DRAW);

        // indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces.data), gl.STATIC_DRAW);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, matrix: Matrix4) {
        
        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(this.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        
        // set uniforms
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);

        // Draw the point.
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}