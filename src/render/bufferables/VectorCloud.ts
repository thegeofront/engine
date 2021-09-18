import { MultiVector3, Vector3 } from "../../lib";
import { Bufferable } from "../Bufferable"
import { Renderable } from "../Renderable";

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