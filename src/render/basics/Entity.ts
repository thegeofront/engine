// purpose: highest level shadable 'object'.
//     like: a tree, a rock, a spawner, an enemy.

import { Matrix4 } from "../../lib";
import { Model } from "./Model";


export class Entity {
    
    constructor(
        public position: Matrix4,
        public model: Model,
    ) {}

    static new(position=Matrix4.new(), model=Model.new()) {
        return new Entity(position, model);
    }
}