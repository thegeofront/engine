// purpose: wrapper around Camera, Lights, and the Sun
//          This is all the data a typical shader requires at render time

import { Color } from "../../image/Color";
import { Vector3 } from "../../lib";
import { Camera } from "./Camera";
import { Light } from "./Light";


export class Scene {
    constructor(
        public camera: Camera, 
        public sun: Light = Light.new(Vector3.new(30,40,50), Color.fromHSL(0.1)),
        public lights: Light[]=[], 
        ) {}

    static new(camera: Camera, sun: Light, lights: Light[]) {
        return new Scene(camera, sun, lights);
    }
}