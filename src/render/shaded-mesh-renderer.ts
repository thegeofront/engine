// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: A shader wrapper for rendering shaded, textured, meshes

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../mesh/line-array";
import { Vector3Array } from "../data/vector-array";
import { RenderMesh } from "../mesh/render-mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { LineRenderer } from "./line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";

export class ShadedMeshRenderer extends Renderer {
    
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

        attribute vec4 a_vertex_position;
        attribute vec3 a_vertex_normal;
        attribute vec2 a_texture_coord;
    
        uniform mat4 u_normal_matrix;
        uniform mat4 u_model_view_matrix;
        uniform mat4 u_projection_matrix;

        // should be uniforms constances
        highp vec3 ambient_light = vec3(0.3, 0.3, 0.3);
        highp vec3 dir_light_color = vec3(1, 1, 1);
        highp vec3 dir_light_vector = normalize(vec3(0.85, 0.8, 0.75));  

        varying highp vec2 v_texture_coord;
        varying highp vec3 v_lighting;
    
        void main(void) {

            gl_Position = u_projection_matrix * u_model_view_matrix * a_vertex_position;
            v_texture_coord = a_texture_coord;
        
            // Apply lighting effect
            highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
            highp vec3 directionalLightColor = vec3(1, 1, 1);
            highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
        
            highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
            v_lighting = ambientLight + (directionalLightColor * directional);
        }
        `;

        const fs = `
        precision mediump float;

        uniform vec3 u_light_direction;
        uniform sampler2D u_texture;

        varying vec2 v_texcoord;
        varying vec3 v_normal;

        // Calculates the diffuse factor produced by the light illumination  
        float diffuseFactor(vec3 normal, vec3 light_direction) {
            float df = dot(normalize(normal), normalize(light_direction));
            if (gl_FrontFacing) {
                df = -df;
            }
            return max(0.0, df);
        }

        void main() {

            // Apply the light diffusion factor
            vec4 surface_color = diffuseFactor(v_normal, u_light_direction);

            // Fragment shader output
            vec4 color = texture2D(u_texture, v_texcoord);
            gl_FragColor = color * vec4(surface_color, 1.0);
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

    setAndRender(gl: WebGLRenderingContext, matrix: Matrix4, mesh: RenderMesh) {
        this.set(gl, mesh, DrawSpeed.DynamicDraw);
        this.render(gl, matrix);
    }

    set(gl: WebGLRenderingContext, mesh: RenderMesh, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        
        if (!mesh.texture) {
            console.warn("Mesh does not contain a texture!");
            return;
        }

        // save how many faces need to be drawn
        gl.useProgram(this.program);
        this.count = mesh.links.data.length

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
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.links.data), this.convertDrawSpeed(speed));

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