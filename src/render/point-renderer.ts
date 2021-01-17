


import { Renderer } from "./renderer";

export class SomeRenderer extends Renderer {

    constructor(gl: WebGLRenderingContext) {

        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it. 
        // putting them somewhere else doesnt make sense to me, 
        // they are coupled 1 to 1.
        let vertexSource: string = `
        attribute vec4 a_position;
        attribute vec4 a_color;

        uniform mat4 u_matrix;

        varying vec4 v_color;

        void main() {
            // Multiply the position by the matrix.
            gl_Position = u_matrix * a_position;

            // Pass the color to the fragment shader.
            v_color = a_color;
        }
        `;
        let fragmentSource: string = `
        precision mediump float;

        // Passed in from the vertex shader.
        varying vec4 v_color;

        uniform vec4 u_colorMult;

        void main() {
            gl_FragColor = v_color * u_colorMult;
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);
        

    }

    setState() {}

    render() {}
}