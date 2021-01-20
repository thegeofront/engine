// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { Rectangle2 } from "../geo/Rectangle";
import { FaceArray, Vector3Array } from "../math/Array";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/Vector";
import { Renderer } from "./renderer";

export class LineRenderer extends Renderer {

    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;
    index_buffer: WebGLBuffer;
    u_transform: WebGLUniformLocation;
    count: number
    constructor(gl: WebGLRenderingContext) {

        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it. 
        // putting them somewhere else doesnt make sense to me, 
        // they are coupled 1 to 1.
        const vs = `
        attribute vec4 a_position;
        uniform mat4 u_transform;

        void main() {
            gl_Position = u_transform * a_position;
        }
        `;

        const fs = `
        precision mediump float;

        void main () {
            gl_FragColor = vec4(1,0,0, 0.5);
        }
        `;

        // setup program    
        super(gl, vs, fs);

        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.count = 0;
        
        // we need 2 buffers 
        // -> 1 float buffer for the positions of all vertices.
        // -> 1 int buffer for the index of all lines
        this.a_position = gl.getAttribLocation(this.program, "a_position");
        this.a_position_buffer = gl.createBuffer()!;
        this.index_buffer = gl.createBuffer()!;
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);     
    }

    set(gl: WebGLRenderingContext, verts: Vector3Array, indices: Uint16Array) {
        
        // save how many faces need to be drawn
        gl.useProgram(this.program);
        this.count = indices.length

        // vertices 
        const size = 3; // size of a vertex, in number of floats 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.vertexAttribPointer(this.a_position, size, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, verts.data, gl.STATIC_DRAW);

        // indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, matrix: Matrix4) {
        
        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(this.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        
        // set uniforms
        // console.log(matrix.data);
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);

        // Draw the point.
        gl.drawElements(gl.LINES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}