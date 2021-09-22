import { ShaderMesh } from "../../lib";
import { Scene } from "../../lib";
import { DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class TemplateShader extends ShaderProgram<ShaderMesh> {

    /**
     * Compile the shader 
     */
    constructor(gl: WebGl) {
        
        let vertexShader = ``;
        let fragmentShader = ``;
        super(gl, ``, ``);
    }

    /**
     * Init all attributes & uniforms
     * Return the DrawMore required for the vertexshader & fragmentshader
     */
    protected onInit(): DrawMode {
        throw new Error("Method not implemented.");
    }

    /**
     * Main load: fill attributes.
     * Return the drawcount, aka the number to feed to DrawElements or DrawArrays
     */
    protected onLoad(data: ShaderMesh, speed: DrawSpeed): number {
        throw new Error("Method not implemented.");
    }

    /**
     * Sub load: fill other attributes or uniforms
     */
    loadSomeOtherUniform() {

    }

    /**
     * Specify which data we need from the scene at runtime
     */
    protected onDraw(c: Scene): void {
        
        throw new Error("Method not implemented.");
    }
}
