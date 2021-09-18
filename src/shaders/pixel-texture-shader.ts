import { ShaderMesh } from "../lib";
import { DrawMode } from "../webgl/Constants";
import { Program } from "../webgl/Program";
import { DrawSpeed } from "../webgl/HelpGl";
import { Context } from "../render/context";

export class PixelTextureShader extends Program<ShaderMesh>{
    
    protected onInit(settings?: any): DrawMode {
        throw new Error("Method not implemented.");
    }
    
    protected onSet(data: ShaderMesh, speed: DrawSpeed): number {
        throw new Error("Method not implemented.");
    }
    
    protected onRender(c: Context): void {
        throw new Error("Method not implemented.");
    }

}