// jos feenstra

import { MultiVector, DrawSpeed, ToFloatMatrix, Context } from "../lib";
import { DrawMode } from "../webgl/Constants";
import { Program } from "../webgl/Program";
import { Shader } from "../webgl/Shader";
import { Uniform } from "../webgl/Uniform";


export class DotShaderWithHeight extends Program<MultiVector> {
    height: Uniform;
    color: Uniform;
    size: Uniform;

    constructor(
        gl: WebGLRenderingContext,
        radius: number = 5,
        color: number[] = [1, 1, 1, 1],
        height: number,
        square: boolean = true,
    ) {
        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it.
        // putting them somewhere else doesnt make sense to me,
        // they are coupled 1 to 1.
        let vertexSource: string = `
        precision mediump int;
        precision mediump float;

        uniform mat4 u_transform;
        uniform vec4 u_color;
        uniform float u_range;
        uniform float u_size;

        attribute vec3 a_vertex;

        varying vec4 v_color;

        void main() {
            // Set the size of a rendered point.
            gl_PointSize = u_size;
            float factor = a_vertex.z / u_range;

            v_color = vec4(u_color.xyz * factor, 1);

            // Transform the location of the vertex.
            gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSourceSquare: string = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        // vec2 center = vec2(0.5, 0.5);

        varying vec4 v_color;

        void main() {
            gl_FragColor = v_color;
        }
        `;

        let fragmentSourceRound: string = `
        precision mediump int;
        precision mediump float;

        uniform vec4 u_color;
        vec2 center = vec2(0.5, 0.5);

        varying vec4 v_color;

        void main() {
            if (distance(center, gl_PointCoord) > 0.5) {
               discard;
            }
            gl_FragColor = v_color;
        }
        `;

        // setup program
        if (square) {
            super(gl, vertexSource, fragmentSourceSquare);
        } else {
            super(gl, vertexSource, fragmentSourceRound);
        }

        this.uniforms.add("u_transform", 16);
        this.size = this.uniforms.add("u_size", 1, [radius]);
        this.color = this.uniforms.add("u_color", 4, color);
        this.height = this.uniforms.add("u_range", 1, [height]);
    }

    onInit() {
        this.attributes.add("a_vertex", 3);
        return DrawMode.Points;
    }

    onSet(points: MultiVector, speed: DrawSpeed) {
        let array = ToFloatMatrix(points);
        this.attributes.set("a_vertex", array.data, speed);
        return array.count();
    }

    onRender(c: Context) {
        this.uniforms.setMatrix4("u_transform", c.camera.totalMatrix);
    }
}
