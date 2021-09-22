// purpose: wrapper around Camera, Lights, and Combo's
// Purpose: Experiment: a collection of renderers, things to render, and Camera's, as common as many 3d engines
// NOTE:    for now, just the camera lives in here

import { Vector3 } from "../../lib";
import { Camera } from "./Camera";
import { Light } from "./Light";

export class Sun {
    
    constructor(
        public direction: Vector3,
        public color: number[],
    ) {}

    static new(direction=Vector3.new(1,1,1).normalize(), color=[0,1,1,1]) {
        return new Sun(direction, color);
    }
}

export class Scene {
    constructor(
        public camera: Camera, 
        public sun: Sun= Sun.new(),
        public lights: Light[]=[], 
        ) {}

    static new(camera: Camera, sun = Sun.new(), lights=[]) {
        return new Scene(camera, sun, lights);
    }
}
