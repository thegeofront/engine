import { Renderable } from "./Renderable";

export abstract class Bufferable<T extends Renderable> {

    abstract buffer() : T
}