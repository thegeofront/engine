// purpose: highest level shadable 'object'.
//     like: a tree, a rock, a spawner, an enemy.

import { Matrix4 } from "../../lib";
import { Model } from "./Model";


export class Entity {
    
    constructor(
        public model: Model,
        public position: Matrix4,
    ) {}

}