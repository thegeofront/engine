// Array.ts
// author: Jos Feenstra
// purpose: Small wrapper around Float32Array to add some functionality. 
// 
// NOTE: all these small wrappers might not be good pratice, but i 
// like to extract simple logic like this to not clutter the code too much

import { Vector2 } from "./Vector2";
import { Vector3 } from "./Vector3";

export class FloatArray {
    data: Float32Array;
    size: number;
    dim: number;

    constructor(data: Float32Array, size: number, dim: number) {
        this.data = data;
        this.size = size;
        this.dim = dim;
    }

    toVector3() : Vector3[] {
        
        if (this.dim != 3) throw "dimention of floatarray is not 3";

        let vecs: Vector3[] = [];
        for (let i = 0 ; i < this.size; i++) {
            vecs.push(new Vector3(
                this.get(i, 0),
                this.get(i, 1),
                this.get(i, 2)
            ));
        }
        return vecs;
    }

    toVector2() : Vector2[] {

        if (this.dim != 2) throw "dimention of floatarray is not 2";

        let vecs: Vector2[] = [];
        for (let i = 0 ; i < this.size; i++) {
            vecs.push(new Vector2(
                this.get(i, 0),
                this.get(i, 1),
            ));
        }
        return vecs;
    }
    
    get(i: number, j: number) : number {
        return this.data[i * this.dim + j];
    }

    set(i: number, j: number, value: number)  {
        this.data[i * this.dim + j] = value;
    }
}