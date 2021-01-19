// jos feenstra

import { Rectangle2 } from "../geo/Rectangle";
import { Matrix4 } from "../math/matrix";
import { Vector2, Vector3 } from "../math/Vector";
import { Renderer } from "./renderer";

export class DotRenderer3 extends Renderer {

    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;

    u_transform: WebGLUniformLocation;
    u_color: WebGLUniformLocation;
    u_size: WebGLUniformLocation;

    color: number[];
    size: number;

    constructor(gl: WebGLRenderingContext, 
        size: number =5, 
        color: number[] = [1,1,1,1], 
        square: boolean= true ) {

        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it. 
        // putting them somewhere else doesnt make sense to me, 
        // they are coupled 1 to 1.
        let vertexSource: string = `
        precision mediump int;
        precision mediump float;

        uniform mat4 u_transform;
        uniform vec4 u_color;
        uniform float u_size;

        attribute vec3 a_vertex;

        void main() {
            // Set the size of a rendered point.
            gl_PointSize = u_size;

            // Transform the location of the vertex.
            gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSourceSquare: string = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        // vec2 center = vec2(0.5, 0.5);

        void main() {
            gl_FragColor = u_color;
        }
        `;

        let fragmentSourceRound: string = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        vec2 center = vec2(0.5, 0.5);

        void main() {
            if (distance(center, gl_PointCoord) > 0.5) {
               discard;
            }
            gl_FragColor = u_color;
        }
        `;

        // setup program
        if (square) {    
            super(gl, vertexSource, fragmentSourceSquare);
        } else {
            super(gl, vertexSource, fragmentSourceRound);
        }

        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.u_size = gl.getUniformLocation(this.program, "u_size")!;
        this.u_color = gl.getUniformLocation(this.program, "u_color")!;

        this.color = color;
        this.size = size;

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        // look up where the vertex data needs to go.
        this.a_position = gl.getAttribLocation(this.program, "a_vertex");
        this.a_position_buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);     
    }

    // render 1 image to the screen
    renderQuick(gl: WebGLRenderingContext, matrix: Matrix4, data: Float32Array) {
        
        const COMPONENTS_PER_ITERATION = 3;

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // set uniforms
        // console.log(matrix.data);
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);
        gl.uniform1f(this.u_size, this.size);
        gl.uniform4f(this.u_color, this.color[0], this.color[1], this.color[2], this.color[3]);

        // // Bind the position buffer.
        gl.enableVertexAttribArray(this.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);

        // // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = COMPONENTS_PER_ITERATION; // componenets per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(this.a_position, size, type, normalize, stride, offset);
        
        // fill with data;
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        
        // Draw the point.
        var primitiveType = gl.POINTS;
        var offset = 0;
        var count = data.length / COMPONENTS_PER_ITERATION;
        gl.drawArrays(primitiveType, offset, count);
    }

    render(gl: WebGLRenderingContext, matrix: Matrix4, dots: Vector3[]) {
     
        let data = this.toFloat32Array(dots);
        return this.renderQuick(gl, matrix, data);
    }

    // Fill the buffer with the values that define a rectangle.
    toFloat32Array(dots: Vector3[]) : Float32Array{
        let data = new Float32Array(dots.length * 3);
        for(let i = 0 ; i < dots.length; i++) {
            data[i*3]     = dots[i].x;
            data[i*3 + 1] = dots[i].y;
            data[i*3 + 2] = dots[i].z;
        }
        return data;
    }
}