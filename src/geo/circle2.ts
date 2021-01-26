import { randUniform } from "@tensorflow/tfjs-core/dist/util";
import { Const } from "../math/const";
import { Vector2 } from "../math/vector";

export class Circle2 {

    center: Vector2;
    radius: number;

    constructor(center: Vector2, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    static centersFromPPR(id1: number, id2: number, this_radius: number) : Vector2[] {
        // throw new Error("Method not implemented.");
        return [new Vector2(0,0)];
    }

    // def centers_from_ppr(pts, r):
    // """
    // calculate the centers of two circles, defined by two points and a radius

    // IN
    //     - pts : np.array(2, 2) -> two points in 3D space
    //     - r : float -> radius of the circle to fit
    // OUT
    //     - centers : np.array(0/1/2) -> zero, one or two circles, based upon
    //       if a circle can be fit between the points

    // thank you mr Mitteldorf for making me remember how basic math works
    // http://mathforum.org/library/drmath/view/53027.html
    // """

    // # get in between length and halfway point
    // normal = pts[1] - pts[0]
    // q = np.linalg.norm(normal)
    // middle = np.mean(pts, axis=0)

    // # scalar length on mirror line (pythagoras)
    // value = r**2 - (q/2)**2
    // if value < 0:
    //     # value is negative -> no solution
    //     return np.array([])
    // elif value < EPSILON:
    //     # value is around zero -> one solution
    //     return np.array([middle])
    // l = (value)**0.5

    // # rotate normal
    // normal = np.array((normal[1], -normal[0])) / q

    // # two solution (both directions)
    // return np.array([middle + normal * l, middle + normal * -l])
}