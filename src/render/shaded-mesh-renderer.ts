// name:    mesh-renderer.ts
// author:  Jos Feenstra
// purpose: A shader wrapper for rendering shaded, textured, meshes

import { IntMatrix } from "../data/int-matrix";
import { LineArray } from "../mesh/line-array";
import { Vector3Array } from "../data/vector-array";
import { NormalKind, RenderMesh } from "../mesh/render-mesh";
import { Matrix4 } from "../math/matrix";
import { DrawSpeed, Renderer } from "./renderer";
import { LineRenderer } from "./line-renderer";
import { SimpleMeshRenderer } from "./simple-mesh-renderer";
import { Camera } from "./camera";

export class ShadedMeshRenderer extends Renderer {
    
    // attribute & uniform locations
    a_vertex_position: number;
    a_vertex_postition_buffer: WebGLBuffer;
    index_buffer: WebGLBuffer;

    count: number;
    size: number;

    u_normal_matrix: WebGLUniformLocation;
    u_model_view_matrix: WebGLUniformLocation;
    u_projection_matrix: WebGLUniformLocation;

    a_vertex_normal: number;
    a_vertex_normal_buffer: WebGLBuffer;
    
    constructor(gl: WebGLRenderingContext) {
        const vs = `

        attribute vec4 a_vertex_position;
        attribute vec3 a_vertex_normal;
        // attribute vec2 a_texture_coord;
    
        uniform mat4 u_normal_matrix;
        uniform mat4 u_model_view_matrix;
        uniform mat4 u_projection_matrix;

        // should be uniforms constances
        vec3 ambient_light = vec3(0.3, 0.3, 0.3);
        vec3 dir_light_color = vec3(1, 1, 1);
        vec3 dir_light_vector = normalize(vec3(0.85, 0.8, 0.75));  

        // varying vec2 v_texture_coord;
        varying vec3 v_lighting;
    
        void main(void) {

            gl_Position = u_projection_matrix * u_model_view_matrix * a_vertex_position;
            // v_texture_coord = a_texture_coord;
        
            // Apply lighting effect
            // highpr is removed
            vec4 transformedNormal = u_normal_matrix * vec4(a_vertex_normal, 1.0);
            float directional = max(dot(transformedNormal.xyz, dir_light_vector), 0.0);
            v_lighting = ambient_light + (dir_light_color * directional);
        }
        `;

        const fs = `
        precision mediump float;

        // Calculates the diffuse factor produced by the light illumination  
        // if done like this, color could look nicer
        // float diffuseFactor(vec3 normal, vec3 light_direction) {
        //     float df = dot(normalize(normal), normalize(light_direction));
        //     if (gl_FrontFacing) {
        //         df = -df;
        //     }
        //     return max(0.0, df);
        // }

        varying vec3 v_lighting;

        void main() {

            // Fragment shader output
            gl_FragColor = vec4(v_lighting, 1.0);
        }
        `;

        // setup program    
        super(gl, vs, fs);

        gl.useProgram(this.program);
        this.count = 0;
        this.size = 0;

        // init uniforms 
        this.u_normal_matrix = gl.getUniformLocation(this.program, "u_normal_matrix")!;
        this.u_model_view_matrix = gl.getUniformLocation(this.program, "u_model_view_matrix")!;
        this.u_projection_matrix = gl.getUniformLocation(this.program, "u_projection_matrix")!;

        // init attributes: verts | normals | index
        this.a_vertex_position = gl.getAttribLocation(this.program, "a_vertex_position");
        this.a_vertex_postition_buffer = gl.createBuffer()!;

        this.a_vertex_normal = gl.getAttribLocation(this.program, "a_vertex_normal");
        this.a_vertex_normal_buffer = gl.createBuffer()!;

        this.index_buffer = gl.createBuffer()!; 
    }

    set(gl: WebGLRenderingContext, mesh: RenderMesh, speed: DrawSpeed = DrawSpeed.StaticDraw) {

        if (mesh.getNormalType() != NormalKind.MultiVertex)

        // save how many faces need to be drawn
        gl.useProgram(this.program);
        this.count = mesh.links.data.length

        // buffer 1
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_vertex_postition_buffer);
        gl.vertexAttribPointer(this.a_vertex_position, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.verts.data, this.convertDrawSpeed(speed));

        // buffer 2 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_vertex_normal_buffer);
        gl.vertexAttribPointer(this.a_vertex_normal, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.norms.data, this.convertDrawSpeed(speed));

        // buffer 3
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.links.data), this.convertDrawSpeed(speed));
    }

    // render 1 image to the screen
    render(gl: WebGLRenderingContext, camera: Camera) {
        
        // console.log("rendering..");

        // use the program
        gl.useProgram(this.program);
        
        // set uniforms
        gl.uniformMatrix4fv(this.u_normal_matrix, false, Matrix4.newIdentity().data);
        gl.uniformMatrix4fv(this.u_model_view_matrix, false, camera.worldMatrix.data);
        gl.uniformMatrix4fv(this.u_projection_matrix, false, camera.projectMatrix.data);
 
        // buffer 1
        gl.enableVertexAttribArray(this.a_vertex_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_vertex_postition_buffer);
        gl.vertexAttribPointer(this.a_vertex_position, 3, gl.FLOAT, false, 0, 0);

        // buffer 2
        gl.enableVertexAttribArray(this.a_vertex_normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_vertex_normal_buffer);
        gl.vertexAttribPointer(this.a_vertex_normal, 3, gl.FLOAT, false, 0, 0);

        // buffer 3
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        
        // draw!
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}