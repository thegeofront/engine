// purpose: wrapper around Camera, Lights, and Combo's
// Purpose: Experiment: a collection of renderers, things to render, and Camera's, as common as many 3d engines
// NOTE:    for now, just the camera lives in here

import { Color } from "../../image/Color";
import { Vector3 } from "../../lib";
import { Camera } from "./Camera";
import { Light } from "./Light";


export class Scene {
    constructor(
        public camera: Camera, 
        public sun: Light = Light.new(Vector3.new(50,50,50), Color.fromHSL(0.1)),
        public lights: Light[]=[], 
        ) {}

    static new(camera: Camera, sun: Light, lights: Light[]) {
        return new Scene(camera, sun, lights);
    }
}