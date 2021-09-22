import { Color } from "../../image/Color";
import { GeonImage } from "../../lib";

export class Material {

    constructor(
        public ambient: Color,
        public diffuse: Color,
        public specular: Color,
        public opacity: number, // 0: transparant, 1: opaque
        public texture: ImageData,
    ) {}

}