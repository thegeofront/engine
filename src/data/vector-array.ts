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
    
    static fromList(vecs: Vector2[]) : Vector2Array {
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

    toList() : Vector2[] {

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
        let clone = new Vector2Array(this._height);
        clone.data = this.data;
        return clone;  
    }
}

export class Vector3Array extends FloatMatrix {
    
    constructor(count: number) {
        super(count, 3);
    }

    static fromList(vecs: Vector3[]) : Vector3Array {
        let length = vecs.length;
        let array = new Vector3Array(length);
        for(let i = 0; i < vecs.length; i++) {
            array.data[i*3] = vecs[i].x;
            array.data[i*3+1] = vecs[i].y;
            array.data[i*3+2] = vecs[i].z;
        }
        return array;
    }

    forEach(callbackfn: (value: Vector3, index: number) => Vector3) : Vector3Array {
        
        for(let i = 0 ; i < this.count(); i++) {
            let vec = this.getVector(i);
            vec = callbackfn(vec, i);
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

    toList() : Vector3[] {

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

    to2D() : Vector2Array {
        let clone = new Vector2Array(this._height);
        for (let i = 0; i < this._height; i++) {
            for (let j = 0; j < 2; j++) {
                clone.set(i, j, this.get(i, j));
            }
        }
        return clone;  
    }

    clone() : Vector3Array {
        let clone = new Vector3Array(this._height);
        for (let i = 0; i < this.data.length; i++) {
            clone.data[i] = this.data[i];
        }
        return clone;  
    }

    mean() : Vector3 {
        // the mean vector of a series of vectors
        let sum = Vector3.zero();

        let count = this.count();
        for(let i = 0; i < count; i++) {
            sum.x += this.data[i*3]
            sum.y += this.data[i*3+1]
            sum.z += this.data[i*3+2]
        }

        return sum.scale(1 / count);
    }
}

export function getGeneralFloatMatrix(vectors: Vector2Array | Vector3Array | Vector2[] | Vector3[]): FloatMatrix {

    if(vectors instanceof Vector2Array) {
        return vectors;
    } else if (vectors instanceof Vector3Array) {
        return vectors;
    } else if (vectors[0] instanceof Vector2) {
        return Vector2Array.fromList(vectors as Vector2[]);
    } else {
        return Vector3Array.fromList(vectors as Vector3[]);
    }
}