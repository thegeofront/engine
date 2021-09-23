import { Color } from "../../image/Color";

export class Material {

    constructor(
        public ambient: Color,
        public diffuse: Color,
        public specular: Color,

        public opacity: number, // 0: transparant, 1: opaque

        public texture?: ImageData,
        public bumpmap?: ImageData,
    ) {}

    static fromObjMtl() {
        throw "TODO!!!";
    }

    static default() {
        return new Material(
            Color.fromHex('#35006a')!,
            Color.fromHex('#ff0080')!,
            Color.fromHex('#ffffff')!,
            1);
    }

}