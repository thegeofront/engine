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

    static newDefault() {
        return new Material(
            Color.fromHex('#444444')!,
            Color.fromHex('#400080')!,
            Color.fromHex('#ffffff')!,
            1);
    }

}