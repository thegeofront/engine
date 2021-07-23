// https://webgl.brown37.net/12_advanced_rendering/07_rendering_points.html

// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer textures as billboards.

// NOTE: make sure to include something like a center offset, to gain control of if the point is rendered centered, as topleft, etc. etc.

import { GeonImage, MultiVector3, MultiVector2, Shader, Context } from "../lib";
import { ToFloatMatrix } from "../data/multi-vector";
import { DrawSpeed, HelpGl } from "../render/webgl";
import { Attribute } from "../render/attribute";
import { Uniform, UniformType } from "../render/uniform";

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
    // exposed Uniforms like this can be use to statically change certain properties
    color: Uniform;
    radius: Uniform;

    constructor(gl: WebGLRenderingContext) {
        // note: I like vertex & fragments to be included in the script itself.
        // when you change vertex or fragment, this class has to deal with it.
        // putting them somewhere else doesnt make sense to me,
        // they are coupled 1 to 1.
        let vertexSource: string = `
        precision mediump int;
        precision mediump float;

        attribute vec3 a_vertex;
        attribute vec2 a_uv_pos; // u, v 
        attribute vec2 a_uv_size; // w, h

        uniform mat4 u_transform;
        uniform vec4 u_color;
        uniform float u_size;

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
        this.uniforms.add("u_transform", 16);
        this.radius = this.uniforms.add("u_size", 1);
        this.color = this.uniforms.add("u_color", 4);

        this.attributes.add("a_vertex", 3);
        this.attributes.add("a_uv_pos", 2);
        this.attributes.add("a_uv_size", 2);
    }

    set(payload: BillboardPayload, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        let gl = this.gl;
        gl.useProgram(this.program);

        // Bind the position buffer
        this.attributes.set("a_vertex", ToFloatMatrix(payload.positions).data, speed);
        this.attributes.set("a_uv_pos", ToFloatMatrix(payload.uvs).data, speed);
        this.attributes.set("a_uv_size", ToFloatMatrix(payload.uvSizes).data, speed);

        // set the count
        this.setDrawCount(payload.positions.count);
    }

    render(c: Context) {
        let gl = this.gl;
        let matrix = c.camera.totalMatrix;
        gl.useProgram(this.program);

        this.uniforms.setMatrix4("u_transform", matrix);
        this.uniforms.loadAll();
        this.attributes.loadAll();

        this.gl.drawArrays(gl.POINTS, 0, this.drawCount);
    }

    setAndRender(data: BillboardPayload, c: Context) {
        this.set(data, DrawSpeed.DynamicDraw);
        this.render(c);
    }
}
