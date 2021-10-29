import { MultiVector2, MultiVector3 } from "../lib";
import { Const } from "../math/Const";
import { LSA } from "../math/LSA";
import { Vector2 } from "../math/Vector2";

export class Circle2 {

    constructor(
        public center: Vector2, 
        public radius: number) {}

    static new(center=Vector2.new(), radius=1) {
        return new Circle2(center, radius);
    }

    static fromLSA(points: MultiVector2) : Circle2 {
        let [x, y, r] = LSA.circle2(points);
        return Circle2.new(Vector2.new(x, y), r);
    }

    // thank you mr Mitteldorf for making me remember how basic math works
    // http://mathforum.org/library/drmath/view/53027.html
    // calculate the centers of two circles, defined by two points and a radius
    static centersFromPPR(a: Vector2, b: Vector2, radius: number): Vector2[] {
        // throw new Error("Method not implemented.");

        // get in between length and halfway point
        let normal = b.clone().sub(a);
        let dis = normal.length();
        let middle = a
            .clone()
            .add(b)
            .scale(1 / 2);

        // scalar length on mirror line (pythagoras)
        let value = radius ** 2 - (dis / 2) ** 2;
        if (value < -Const.TOLERANCE) {
            // no sollution
            return [];
        } else if (value < Const.TOLERANCE) {
            // center roughly in the middle, so just return the middle
            return [middle];
        } else {
            // two circles possible:
            let disToCenter = value ** 0.5;
            let normY = new Vector2(normal.y, -normal.x).normalize();

            // move the middle point up and down
            return [
                middle.clone().add(normY.clone().scale(disToCenter)),
                middle.clone().add(normY.clone().scale(-disToCenter)),
            ];
        }
    }

    /**
     * Caclulate how far this point is removed from the circle 
     */
    distance(point: Vector2) {

        let distance = this.center.disTo(point);

        return distance - this.radius;
    }
}
