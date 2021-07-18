// https://webgl.brown37.net/12_advanced_rendering/07_rendering_points.html

// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer textures as billboards.

// NOTE: make sure to include something like a center offset, to gain control of if the point is rendered centered, as topleft, etc. etc.

import { GeonImage, MultiVector3, MultiVector2, Shader, Context } from "../lib";
import { ToFloatMatrix } from "../data/multi-vector";
import { DrawSpeed, HelpGl } from "../render/webgl";

// mooi font om te gebruiken
// https://datagoblin.itch.io/monogram

/**
 * This is all data we need to render
 */
export type BillboardPayload = {
    texture: GeonImage; // texture atlas to use
    positions: MultiVector3; // position in the world to render this
    // positionUvs: MultiVector2; // the coordinate of the 'center point', from the perspective of a billboard
    uvs: MultiVector2; //
    uvSizes: MultiVector2;
};

/**
 * Used to render multiple billboards.
 * One Texture per billboard.
 */
export class BillboardShader extends Shader<BillboardPayload> {
    // TODO can we do something intelligent with this stuff ?

    // attribute & uniform locations
    a_position: number;
    a_position_buffer: WebGLBuffer;

    a_uv_data: number;
    a_uv_data_buffer: WebGLBuffer;

    u_transform: WebGLUniformLocation;
    u_color: WebGLUniformLocation;
    u_size: WebGLUniformLocation;

    color: number[];
    size: number;
    count: number;

    constructor(gl: WebGLRenderingContext) {
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
        attribute vec4 a_uv_data; // u, v, w, h, 
    
        void main() {
            // Set the size of a rendered point.
            gl_PointSize = u_size;

            // Transform the location of the vertex.
            gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSource: string = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        // vec2 center = vec2(0.5, 0.5);

        void main() {
            gl_FragColor = u_color;
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);

        this.u_transform = gl.getUniformLocation(this.program, "u_transform")!;
        this.u_size = gl.getUniformLocation(this.program, "u_size")!;
        this.u_color = gl.getUniformLocation(this.program, "u_color")!;

        // init buffer 1
        this.a_position = gl.getAttribLocation(this.program, "a_vertex");
        this.a_position_buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);

        // init buffer 2
        this.a_position = gl.getAttribLocation(this.program, "a_uv_data");
        this.a_position_buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
    }

    set(payload: BillboardPayload, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        let gl = this.gl;
        gl.useProgram(this.program);

        // convert all possible entries to a general entry
        let array = ToFloatMatrix(payload.positions);

        // from some other thing
        this.count = array.count();

        // // Bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.enableVertexAttribArray(this.a_position);
        gl.vertexAttribPointer(this.a_position, array.width, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, array.data, HelpGl.convertDrawSpeed(gl, speed));
    }

    render(c: Context) {
        let gl = this.gl;
        let matrix = c.camera.totalMatrix;
        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // set uniforms
        // console.log(matrix.data);
        gl.uniformMatrix4fv(this.u_transform, false, matrix.data);
        gl.uniform1f(this.u_size, this.size);
        gl.uniform4f(this.u_color, this.color[0], this.color[1], this.color[2], this.color[3]);

        // // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_position_buffer);
        gl.enableVertexAttribArray(this.a_position);
        gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);

        // Draw the point.
        gl.drawArrays(gl.POINTS, 0, this.count);
    }

    setAndRender(data: BillboardPayload, c: Context) {
        this.set(data, DrawSpeed.DynamicDraw);
        this.render(c);
    }
}
