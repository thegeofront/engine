import { Color } from "../../image/Color";

export class Material {

    constructor(
        public ambient: Color,
        public diffuse: Color,
        public specular: Color,

        public specularDampner: number,
        public opacity: number, // 0: transparant, 1: opaque
        public texture?: ImageData,
        public bumpmap?: ImageData,
    ) {}

    static fromObjMtl() {
        throw "TODO!!!";
    }

    static newPurple() {
        return new Material(
            Color.fromHex('#35006a')!,
            Color.fromHex('#ff0080')!,
            Color.fromHex('#513600')!,
            3.195,
            1);
    }

    static default() {
        return new Material(
            Color.fromHex('#4f009d')!,
            Color.fromHex('#06ffff')!,
            Color.fromHex('#58593e')!,
            3.195,
            1);
    }
}