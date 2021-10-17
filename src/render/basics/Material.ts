import { Color } from "../../image/Color";
import { Texture } from "../../lib";

export class Material {
    
    constructor(
        public ambient: Color,
        public diffuse: Color,
        public specular: Color,
        public occluded: Color,

        public specularDampner: number,
        public opacity: number, // 0: transparant, 1: opaque
        public texture?: Texture,
        public bumpmap?: Texture,
    ) {}

    static fromObjMtl() {
        throw new Error("TODO!!!");
    }

    static fromTexture(texture: Texture) {
        let mat = Material.neutral();
        mat.texture = texture;
        return mat;
    }

    static newPurple() {
        return new Material(
            Color.fromHex("#35006a")!,
            Color.fromHex("#ff0080")!,
            Color.fromHex("#513600")!,
            Color.fromHex("#1b0035")!,
            3.195,
            1,
        );
    }

    static neutral() {
        return new Material(
            Color.fromHex("#111111")!,
            Color.fromHex("#000000")!,
            Color.fromHex("#000000")!,
            Color.fromHex("#000000")!,
            3.195,
            1,
        );
    }

    static default() {
        return new Material(
            Color.fromHex("#4f009d")!,
            Color.fromHex("#06ffff")!,
            Color.fromHex("#58593e")!,
            Color.fromHex("#1b0035")!,
            3.195,
            1,
        );
    }
}
