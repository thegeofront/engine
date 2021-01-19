// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: WebGL based rendering of a mesh.

import { Rectangle2 } from "../geo/Rectangle";
import { FaceArray, Vector3Array } from "../math/Array";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/Vector";
import { Renderer } from "./renderer";

export class DotRenderer3 extends Renderer {

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
        // attribute vec3 a_normal;

        uniform mat4 u_transform;
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
        precision mediump float;

        // varying vec3 v_normal;

        // uniform vec4 u_diffuse;
        // uniform vec3 u_lightDirection;

        void main () {
            // vec3 normal = normalize(v_normal);
            // float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
            // gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
            gl_FragColor = vec4(0.5,0.5,0.5, 1);
        }
        `;

        // setup program    
        super(gl, vs, fs);

        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.count = 0;
        // 
        this.a_position = gl.getAttribLocation(this.program, "a_vertex");
        this.a_position_buffer = gl.createBuffer()!;
        this.index_buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);     
    }

    set(gl: WebGLRenderingContext, verts: Vector3Array, faces: FaceArray) {
        
        // 
        this.count = faces.data.length

        // // all vertices
        gl.useProgram(this.program);

        gl.enableVertexAttribArray(this.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);

        var size = 3; // componenets per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        gl.vertexAttribPointer(this.a_position, size, gl.FLOAT, false, 0, 0);
        
        // fill with data;
        gl.bufferData(gl.ARRAY_BUFFER, verts.data, gl.DYNAMIC_DRAW);

        // vertex index 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

        // // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        // var size = 3; // componenets per iteration
        // var type = gl.FLOAT;   // the data is 32bit floats
        // var normalize = false; // don't normalize the data
        // gl.vertexAttribPointer(this.index_buffer, gl.FLOAT, type, false, 0, 0);
        
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces.data, gl.DYNAMIC_DRAW);
        
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, matrix: Matrix4) {
        
        const COMPONENTS_PER_ITERATION = 3;

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // set uniforms
        // console.log(matrix.data);
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);

        // Draw the point.
        var mode = gl.TRIANGLES;
        var offset = 0;
        gl.drawElements(mode, offset, gl.UNSIGNED_SHORT, this.count);
    }
}