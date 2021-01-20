// name:    array.ts
// author:  Jos Feenstra
// purpose: Small wrapper around Float32Array to add interoperability with Vector2 & Vector3, 
//          while remaining a datastructure thats easy to pass over to webgl
// 
// NOTE:    all these small wrappers might not be good pratice, but i 
//          like to extract simple logic like this to not clutter the code too much

import { Vector3, Vector2 } from "./vector";



export class FloatArray {

    data: Float32Array;
    count: number;
    dim: number;

    constructor(count: number, dim: number) {
        this.data = new Float32Array(count * dim);
        this.count = count; // number of entries
        this.dim = dim; // dimention of entry
    }
   
    setAll(data: number[]) {
        this.data.set(data);
    }

    get(i: number, j: number) : number {
        return this.data[i * this.dim + j];
    }
    
    getRow(i: number) : Float32Array[] {
        if (i < 0 || i > this.dim) throw "column is out of bounds for FloatArray"
        throw "not implemented...";
    }

    getColumn(j: number) : Float32Array {
        if (j < 0 || j > this.dim) throw "column is out of bounds for FloatArray"

        let data = new Float32Array(this.count);
        for (let i = 0; i < this.count; i++) {
            let index = i * this.dim + j;
            data[i] = this.data[index];       
        }
        return data;
    }

    set(i: number, j: number, value: number)  {
        this.data[i * this.dim + j] = value;
    }

    setRow(i: number, row: number[]) {
        if (this.dim != row.length) throw "dimention of floatarray is not " + row.length;
        throw "not implemented...";
    }
}

export class Vector2Array extends FloatArray {
   
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
        this.data[i * this.dim + 0] = vec.x;
        this.data[i * this.dim + 1] = vec.y;
    }

    getVector(i: number) : Vector2 {
        return new Vector2(
            this.data[i * this.dim + 0],
            this.data[i * this.dim + 1],
        )
    }

    toNativeArray() : Vector2[] {

        let vecs: Vector2[] = [];
        for (let i = 0 ; i < this.count; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }
}

export class Vector3Array extends FloatArray {
    
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
        this.data[i * this.dim + 0] = vec.x;
        this.data[i * this.dim + 1] = vec.y;
        this.data[i * this.dim + 2] = vec.z;
    }

    getVector(i: number) : Vector3 {
        return new Vector3(
            this.data[i * this.dim + 0],
            this.data[i * this.dim + 1],
            this.data[i * this.dim + 2],
        )
    }

    toNativeArray() : Vector3[] {

        let vecs: Vector3[] = [];
        for (let i = 0 ; i < this.count; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }
}

export class FaceArray extends FloatArray {

    constructor(count: number) {
        super(count, 3);
    }
}