import { ShaderMesh } from "../lib";
import { DrawMode } from "../render-low/constants";
import { Program } from "../render-low/program";
import { DrawSpeed } from "../render-low/webgl";
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