import { Const, Domain, Domain2, MultiLine } from "../../lib";
import { Bufferable } from "../../render/basics/Bufferable";
import { Circle3 } from "./Circle3";
import { Plane } from "./Plane";

export class Arc3 implements Bufferable<MultiLine> {
    
    constructor(
        public circle: Circle3,
        public domain: Domain,
    ) {}

    /**
     * From Circle and Domain
     */
    static fromCD(circle: Circle3, domain: Domain) {
        return new Arc3(circle, domain);
    }

    /**
     * from Plane, Radius and Domain
     */
    static fromPRD(plane: Plane, radius: number, domain: Domain) {
        return new Arc3(Circle3.new(plane, radius), domain);
    }

    buffer(): MultiLine {
        return MultiLine.fromCircle(this.circle, Const.CIRCLE_SEGMENTS, this.domain);
    }

}