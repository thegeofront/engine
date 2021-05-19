import { Matrix4 } from "../math/matrix";
import { Vector3 } from "../math/vector";
import { FloatMatrix } from "./float-matrix";
import { MultiVector2 } from "./multi-vector-2";

export class MultiVector3 extends FloatMatrix {
    constructor(count: number) {
        super(count, 3);
    }

    static fromList(vecs: Vector3[]): MultiVector3 {
        let length = vecs.length;
        let array = new MultiVector3(length);
        for (let i = 0; i < vecs.length; i++) {
            array.data[i * 3] = vecs[i].x;
            array.data[i * 3 + 1] = vecs[i].y;
            array.data[i * 3 + 2] = vecs[i].z;
        }
        return array;
    }

    static fromNative(native: number[][]): MultiVector3 {
        // assume all subarrays have the same shape!!
        let height = native.length;
        let matrix = new MultiVector3(height);
        for (var i = 0; i < native.length; i++) {
            for (var j = 0; j < native[0].length; j++) {
                matrix.set(i, j, native[i][j]);
            }
        }
        return matrix;
    }

    fillFromList(vecs: Vector3[]) {
        for (let i = 0; i < vecs.length; i++) {
            this.data[i * 3] = vecs[i].x;
            this.data[i * 3 + 1] = vecs[i].y;
            this.data[i * 3 + 2] = vecs[i].z;
        }
    }

    forEach(callbackfn: (value: Vector3, index: number) => any): MultiVector3 {
        for (let i = 0; i < this.count(); i++) {
            let vec = this.getVector(i);
            vec = callbackfn(vec, i)!;
            if (vec instanceof Vector3) {
                this.setVector(i, vec);
            }
        }
        return this;
    }

    take(indices: number[]): MultiVector3 {
        // create a new floatarray
        const count = indices.length;
        let array = new MultiVector3(count);
        for (let i = 0; i < count; i++) {
            let getIndex = indices[i];
            array.setVector(i, this.getVector(getIndex));
        }
        return array;
    }

    map(callbackfn: (value: Vector3, index: number) => any): MultiVector3 {
        let clone = this.clone();

        for (let i = 0; i < this.count(); i++) {
            let vec = this.getVector(i);
            let result = callbackfn(vec, i)!;
            if (result instanceof Vector3) {
                clone.setVector(i, result);
            } else {
                clone.setVector(i, vec);
            }
        }
        return clone;
    }

    mapWith(other: MultiVector3, callback: (a: number, b: number) => number) {
        return super.mapWith(other, callback) as MultiVector3;
    }

    setVector(i: number, vec: Vector3) {
        this.data[i * this.width + 0] = vec.x;
        this.data[i * this.width + 1] = vec.y;
        this.data[i * this.width + 2] = vec.z;
    }

    getVector(i: number): Vector3 {
        return new Vector3(
            this.data[i * this.width + 0],
            this.data[i * this.width + 1],
            this.data[i * this.width + 2],
        );
    }

    toList(): Vector3[] {
        let vecs: Vector3[] = [];
        for (let i = 0; i < this.height; i++) {
            vecs.push(this.getVector(i));
        }
        return vecs;
    }

    transform(m: Matrix4): MultiVector3 {
        // THIS CAN BE SPEED UP: BOTH MATRIX 4 & VECTOR3ARRAY ARE JUST FLOAT-MATRICES
        for (let i = 0; i < this.height; i++) {
            let vec = this.getVector(i);
            vec = m.multiplyVector(vec);
            this.setVector(i, vec);
        }
        // this.data = m.MultiplyM(this).data;
        return this;
    }

    to2D(): MultiVector2 {
        return MultiVector2.fromMatrix(this);
    }

    clone(): MultiVector3 {
        let clone = new MultiVector3(this.height);
        for (let i = 0; i < this.data.length; i++) {
            clone.data[i] = this.data[i];
        }
        return clone;
    }

    mean(): Vector3 {
        // the mean vector of a series of vectors
        let sum = Vector3.zero();

        let count = this.count();
        for (let i = 0; i < count; i++) {
            sum.x += this.data[i * 3];
            sum.y += this.data[i * 3 + 1];
            sum.z += this.data[i * 3 + 2];
        }

        return sum.scale(1 / count);
    }

    average(): Vector3 {
        return this.mean();
    }

    closestId(point: Vector3): number {
        let lowScore = Infinity;
        let id = -1;

        this.forEach((v, i) => {
            let disSquared = point.disToSquared(v);
            if (disSquared < lowScore) {
                lowScore = disSquared;
                id = i;
            }
        });
        return id;
    }

    closestIds(point: Vector3, n: number): number[] {
        // O(m*n)... TODO implement quicksort

        let ids: number[] = [];

        for (let i = 0; i < n; i++) {
            let lowScore = Infinity;
            let id = -1;
            this.forEach((v, i) => {
                if (ids.includes(id)) return;
                let disSquared = point.disToSquared(v);
                if (disSquared < lowScore) {
                    lowScore = disSquared;
                    id = i;
                }
            });
            ids.push(id);
        }
        return ids;
    }
}
