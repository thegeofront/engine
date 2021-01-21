// name:    array.ts
// author:  Jos Feenstra
// purpose: Small wrapper around Float32Array to add interoperability with Vector2 & Vector3, 
//          while remaining a datastructure thats easy to pass over to webgl
// 
// NOTE:    all these small wrappers might not be good pratice, but i 
//          like to extract simple logic like this to not clutter the code too much

import { Matrix } from "./matrix";
import { Vector3, Vector2 } from "./vector";

export class Vector2Array extends Matrix {
   
    constructor(count: number) {
        super(count, 2);
    }

    static fromNativeArray(vecs: Vector2[]) : Vector2Array {
        let length = vecs.length;
        let array = new Vector2Array(length);
        for(let i = 0; i < vecs.length; i++) {
            array.data[i] = vecs[i].x;
            array.data[i+1] = vecs[i].y;
        }
        return array;
    }

    setVector(i: number, vec: Vector2) {
        this.data[i * this.width + 0] = vec.x;
        this.data[i * this.width + 1] = vec.y;
    }

    getVector(i: number) : Vector2 {
        return new Vector2(
            this.data[i * this.width + 0],
            this.data[i * this.width + 1],
        )
    }

    toNativeArray() : Vector2[] {

        let vecs: Vector2[] = [];
        for (let i = 0 ; i < this.height; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }
}

export class Vector3Array extends Matrix {
    
    constructor(count: number) {
        super(count, 3);
    }

    static fromNativeArray(vecs: Vector3[]) : Vector3Array {
        let length = vecs.length;
        let array = new Vector3Array(length);
        for(let i = 0; i < vecs.length; i++) {
            array.data[i] = vecs[i].x;
            array.data[i+1] = vecs[i].y;
            array.data[i+2] = vecs[i].z;
        }
        return array;
    }

    setVector(i: number, vec: Vector3) {
        this.data[i * this.width + 0] = vec.x;
        this.data[i * this.width + 1] = vec.y;
        this.data[i * this.width + 2] = vec.z;
    }

    getVector(i: number) : Vector3 {
        return new Vector3(
            this.data[i * this.width + 0],
            this.data[i * this.width + 1],
            this.data[i * this.width + 2],
        )
    }

    toNativeArray() : Vector3[] {

        let vecs: Vector3[] = [];
        for (let i = 0 ; i < this.height; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }
}

export class FaceArray extends Matrix {

    constructor(count: number) {
        super(count, 3);
    }
}