// // // Name:    scene.ts
// // // Author:  Jos Feenstra
// // // Purpose: Experiment: a collection of renderers, things to render, and Camera's, as common as many 3d engines
// // // NOTE:    Implement this correctly later, this is just a sketch for now

import { LineArray } from "../mesh/line-array";
import { Plane } from "../geo/plane";
import { Renderable } from "../mesh/render-mesh";
import { InputState } from "../system/input-state";
import { Parameter } from "../system/ui";
import { Camera } from "./camera";
import { Vector3 } from "../math/vector";
import { DrawSpeed, Renderer } from "./renderer";

export class Light {
    private constructor(
        public pos: Vector3,
        public color: number[],
        public spot: boolean,
        public dir: Vector3,
    ) {}

    static new(pos: Vector3, color = [1, 1, 1, 1]) {
        return new Light(pos, color, false, Vector3.zero());
    }
}

export class RenderInfo {
    // renderinfo

    private constructor(public camera: Camera, public lights: Light[]) {}

    static new(camera: Camera, lights: Light[] = []) {
        return new RenderInfo(camera, lights);
    }
}
