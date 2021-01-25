// name:    array.ts
// author:  Jos Feenstra
// purpose: Small wrapper around Float32Array / FloatMatrix to add interoperability with Vector2 & Vector3, 
//          while remaining a datastructure thats easy to pass over to webgl
// 
// NOTE:    all these small wrappers might not be good pratice, but I 
//          like to extract simple logic like this to not clutter the code too much

import { Matrix4 } from "../math/matrix";
import { Vector3, Vector2 } from "../math/vector";
import { FloatMatrix } from "./float-matrix";

export class Vector2Array extends FloatMatrix {
   
    constructor(count: number) {
        super(count, 2);
    }
    
    static fromNativeArray(vecs: Vector2[]) : Vector2Array {
        let length = vecs.length;
        let array = new Vector2Array(length);
        for(let i = 0; i < vecs.length; i++) {
            array.data[i*2] = vecs[i].x;
            array.data[i*2+1] = vecs[i].y;
        }
        return array;
    }

    forEach(callbackfn: (value: Vector2, index: number) => void) : Vector2Array {
        
        for(let i = 0 ; i < this.count(); i++) {
            let vec = this.getVector(i);
            callbackfn(vec, i);
            this.setVector(i, vec);
        }
        return this;
    }

    setVector(i: number, vec: Vector2) {
        this.data[i * this._width + 0] = vec.x;
        this.data[i * this._width + 1] = vec.y;
    }

    getVector(i: number) : Vector2 {
        return new Vector2(
            this.data[i * this._width + 0],
            this.data[i * this._width + 1],
        )
    }

    toNativeArray() : Vector2[] {

        let vecs: Vector2[] = [];
        for (let i = 0 ; i < this._height; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }

    toVector3Array() : Vector3Array {
        let array = new Vector3Array(this.count());
        for(let i = 0 ; i < this.count(); i++) {
            let row = this.getRow(i);
            array.setRow(i, [row[0], row[1], 0]);
        }
        return array;
    }

    clone() : Vector2Array {
        return super.clone() as Vector2Array;
    }
}

export class Vector3Array extends FloatMatrix {
    
    constructor(count: number) {
        super(count, 3);
    }

    static fromNativeArray(vecs: Vector3[]) : Vector3Array {
        let length = vecs.length;
        let array = new Vector3Array(length);
        for(let i = 0; i < vecs.length; i++) {
            array.data[i*3] = vecs[i].x;
            array.data[i*3+1] = vecs[i].y;
            array.data[i*3+2] = vecs[i].z;
        }
        return array;
    }

    forEach(callbackfn: (value: Vector3, index: number) => void) : Vector3Array {
        
        for(let i = 0 ; i < this.count(); i++) {
            let vec = this.getVector(i);
            callbackfn(vec, i);
            this.setVector(i, vec);
        }
        return this;
    }

    setVector(i: number, vec: Vector3) {
        this.data[i * this._width + 0] = vec.x;
        this.data[i * this._width + 1] = vec.y;
        this.data[i * this._width + 2] = vec.z;
    }

    getVector(i: number) : Vector3 {
        return new Vector3(
            this.data[i * this._width + 0],
            this.data[i * this._width + 1],
            this.data[i * this._width + 2],
        )
    }

    toNativeArray() : Vector3[] {

        let vecs: Vector3[] = [];
        for (let i = 0 ; i < this._height; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }

    transform(m: Matrix4) : Vector3Array {

        for (let i = 0 ; i < this._height; i++) {
            let vec = this.getVector(i);
            vec = m.multiplyVector(vec);
            this.setVector(i, vec);
        }
        // this.data = m.MultiplyM(this).data;
        return this;
    }

    clone() : Vector3Array {
        return super.clone() as Vector3Array;
    }
}