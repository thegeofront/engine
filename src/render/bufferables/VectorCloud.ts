import { MultiVector3, Vector3 } from "../../lib";
import { Renderable } from "../basics/Renderable";
import { Bufferable } from "../Bufferable"

/**
 * A point cloud with direction property
 */
export class VectorCloud implements Bufferable {

    constructor(
        public points: Vector3,
        public directions: Vector3,
    ) {}

    buffer(): Renderable {
        throw new Error("Method not implemented.");
    }
}