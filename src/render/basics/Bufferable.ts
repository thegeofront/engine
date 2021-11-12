import { Shadable } from "./Shadable";

export abstract class Bufferable<T extends Shadable> {

    abstract buffer() : T
}