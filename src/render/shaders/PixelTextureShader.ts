import { ShaderMesh } from "../../lib";
import { Scene } from "../Scene";
import { DrawMode } from "../webgl/Constants";
import { DrawSpeed } from "../webgl/HelpGl";
import { Program } from "../webgl/Program";

export class PixelTextureShader extends Program<ShaderMesh> {
    protected onInit(settings?: any): DrawMode {
        throw new Error("Method not implemented.");
    }

    protected onSet(data: ShaderMesh, speed: DrawSpeed): number {
        throw new Error("Method not implemented.");
    }

    protected onRender(c: Scene): void {
        throw new Error("Method not implemented.");
    }
}
