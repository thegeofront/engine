import { Plane, Vector3 } from "../../lib";

export class Line3 {

    // these dummy can be used to prevent a script from creating new vectors. handle with care!
    // static _dummya = Vector3.zero();
    // static _dummyb = Vector3.zero();
    // static _dummyc = Vector3.zero(); 

    static linexPlane(a: Vector3, b: Vector3, plane: Plane) {
        // let _dummya = Vector3.zero();
        // let _dummyb = Vector3.zero();
        // let _dummyc = Vector3.zero(); 

        let ba = a.subbed(b);
        let cross = plane.khat;
        let top = cross.dot(a.subbed(plane.center));
        let bot = ba.dot(cross);
        if (bot == 0) {
            return undefined;
        }
        let t = top / bot;
        if (t < 0 || t > 1) {
            return undefined;
        }
        return Vector3.fromLerp(a, b, t);
    }

}