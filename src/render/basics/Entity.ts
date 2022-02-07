// purpose: highest level shadable 'object'.
//     like: a tree, a rock, a spawner, an enemy.
// TODO: the idea of ActiveEntity (a spider) vs PassiveEntity (a tree)

import { Transform } from "../../math/Transform";
import { Model } from "./Model";

export class Entity {
    
    constructor(
        public xform: Transform,
        public model: Model,
    ) {}

    static new(position=Transform.new(), model=Model.new()) {
        return new Entity(position, model);
    }
}