// Name:    scene.ts
// Author:  Jos Feenstra
// NOTE:    not used yet

import { Color } from "../../image/Color";
import { Vector3 } from "../../lib";

export class Light {
    private constructor(
        public pos: Vector3,
        public color: Color
    ) {}

    static new(pos: Vector3, color = Color.fromRGB()) {
        return new Light(pos, color);
    }

    static newDirectional(pos: Vector3, color = Color.fromRGB()) {
        return new Light(pos, color);
    }
}
