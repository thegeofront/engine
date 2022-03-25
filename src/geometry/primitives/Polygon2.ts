import {
    GeonMath,
    IntMatrix,
    Mesh,
    MultiVector2,
    MultiVector3,
    Triangulator,
    Vector2,
} from "../../lib";

export class Polygon2 {
    trait = "polygon-2";

    constructor(public data: number[][][]) {}

    static fromList(data: number[][][]) {
        return new Polygon2(data);
    }

    clone() {
        // TODO create a more decent deepcopy
        return new Polygon2(JSON.parse(JSON.stringify(this.data)));
    }

    toMesh(): Mesh {
        let res = Triangulator.flatten(this.data);
        let triangles = Triangulator.triangulate(res.vertices, res.holes, res.dimensions);

        return new Mesh(
            MultiVector2.fromData(res.vertices).to3D(),
            IntMatrix.fromList(triangles, 3),
        );
    }

    getCenter() {
        let x = 0;
        let y = 0;
        let count = 0;

        for (let loop of this.data) {
            for (let vert of loop) {
                count += 1;
                x += vert[0];
                y += vert[1];
            }
        }

        return Vector2.new(x / count, y / count);
    }

    offset(offset: Vector2) {
        for (let loop of this.data) {
            for (let vert of loop) {
                vert[0] += offset.x;
                vert[1] += offset.y;
            }
        }
    }

    scale(factor: number) {
        let center = this.getCenter();

        for (let loop of this.data) {
            for (let vert of loop) {
                vert[0] = GeonMath.lerp(vert[0], center.x, factor);
                vert[1] = GeonMath.lerp(vert[1], center.y, factor);
            }
        }
    }
}
