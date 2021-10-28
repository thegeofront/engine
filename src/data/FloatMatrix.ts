import { Geometry } from "../geometry/Geometry";
import { Stat } from "../lib";
import { Matrix4 } from "../math/Matrix4";

// generic all-pupose matrix of floats
export class FloatMatrix {
    data: Float32Array;
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number, data: number[] = []) {
        
        this.width = width;
        this.height = height;
        
        this.data = new Float32Array(this.width * this.height);
        if (data == [] || data.length == 0) {
            // this.fill(0); // not needed, and not efficient ;)
        } else {
            this.setData(data);
        }
    }

    static mulBtoA(A: FloatMatrix, B: FloatMatrix) {
        // / matrix multiplications are weird. Sometimes, A*B is noted in some book, when they mean B*A in actuality
        
        // console.log(`attempting to multiply A [${A.width}x${A.height}] to B [${B.width}x${B.height}]`)
        
        return B.mul(A);
    }

    static mulAtoB(A: FloatMatrix, B: FloatMatrix) {
        // / matrix multiplications are weird. Sometimes, A*B is noted in some book, when they mean B*A in actuality
        console.log(`attempting to multiply A [${A.width}x${A.height}] to B [${B.width}x${B.height}]`)
        return A.mul(B);
    }

    static multiply(a: FloatMatrix, b: FloatMatrix) {
        return b.mul(a);
    }

    static zeros(width=1, height=1) {
        return new FloatMatrix(width, height);
    }

    /**
     * stack a bunch of equal-length arrays horizontally
     */
    static vstack(...arrays: number[][]) {
        if (arrays.length == 0) throw new Error("need minimum of one array...");

        let height = arrays.length;
        let width = arrays[0].length;
        let matrix = FloatMatrix.zeros(width, height);
        for (let i = 0; i < height; i++) {
            if (arrays[i].length != width) throw new Error("all arrays need to be the same length");
            for (let j = 0; j < width; j++) {
                matrix.set(i, j, arrays[i][j]);
            }
        }
    }

    static fromNative(native: number[][]): FloatMatrix {
        // assume all subarrays have the same shape!!
        let height = native.length;
        let width = native[0].length;
        let matrix = new FloatMatrix(width, height);
        for (var i = 0; i < native.length; i++) {
            for (var j = 0; j < native[0].length; j++) {
                matrix.set(i, j, native[i][j]);
            }
        }
        return matrix;
    }

    clone(): FloatMatrix {
        let clone = new FloatMatrix(this.width, this.height);
        for (let i = 0; i < this.data.length; i++) {
            clone.data[i] = this.data[i];
        }
        return clone;
    }

    // [GETTING & SETTING]

    print() {

        let strings: string[] = [];
        const WIDTH = 8;
        for (var i = 0; i < this.height; i++) {
            strings.push("|");
            for (var j = 0; j < this.width; j++) {
                let str = this.get(i, j).toFixed(2); // TODO THIS IS INCORRECT
                str = str.padStart(WIDTH, " ");
                strings.push(str);

                if (j < this.width - 2) {
                    strings.push("  ");
                }
            }
            strings.push("  |\n");
        }
        console.log(strings.join(""));
    }

    setData(data: number[]) {
        if (data.length != this.height * this.width)
            throw "data.length does not match width * height " + data.length.toString();
        this.data.set(data);
    }

    count() {
        // number of entries / rows.
        // when derrived classes ask for 'how many of x?' they usually mean this.
        return this.height;
    }

    get size() {
        return this.width * this.height;
    }

    getDimensions(): [number, number] {
        return [this.height, this.width];
    }

    fill(value: number) {
        let size = this.height * this.width;
        for (let i = 0; i < size; i++) {
            this.data[i] = value;
        }
    }

    fillWith(data: number[] | Float32Array, valuesPerEntry: number = this.width) {
        // values per entry can be used to setData which is not of the same shape.
        let vpe = valuesPerEntry;
        if (vpe > this.width)
            throw "values per entry is larger than this._width. This will spill over.";
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < vpe; j++) {
                this.set(i, j, data[i * vpe + j]);
            }
        }
    }

    fillFrom(other: FloatMatrix): FloatMatrix {
        if (other.height < this.height || other.width < this.width) {
            throw new Error("need same dimentions");
        }

        for (let i = 0; i < other.height; i++) {
            for (let j = 0; j < 2; j++) {
                this.set(i, j, other.get(i, j));
            }
        }
        return this;
    }

    get(i: number, j: number): number {
        return this.data[i * this.width + j];
    }

    getRow(i: number): Float32Array {
        // if (i < 0 || i > this.height) throw "column is out of bounds for FloatArray"
        let data = new Float32Array(this.width);
        for (let j = 0; j < this.width; j++) {
            data[j] = this.get(i, j);
        }
        return data;
    }

    getColumn(j: number): Float32Array {
        // if (j < 0 || j > this.width) throw "column is out of bounds for FloatArray"
        let data = new Float32Array(this.height);
        for (let i = 0; i < this.height; i++) {
            let index = i * this.width + j;
            data[i] = this.data[index];
        }
        return data;
    }

    set(i: number, j: number, value: number) {
        this.data[i * this.width + j] = value;
    }

    setRow(rowIndex: number, row: number[] | Float32Array) {
        // if (this.width != row.length) throw "dimention of floatarray is not " + row.length;
        for (let j = 0; j < this.width; j++) {
            this.set(rowIndex, j, row[j]);
        }
    }

    forEachValue(callbackfn: (value: number, index: number) => number): FloatMatrix {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = callbackfn(this.data[i], i);
        }
        return this;
    }

    takeRows(indices: number[]): FloatMatrix {
        // create a new floatarray
        const count = indices.length;
        let array = new FloatMatrix(count, this.width);
        for (let i = 0; i < count; i++) {
            let getIndex = indices[i];
            array.setRow(i, this.getRow(getIndex));
        }
        return array;
    }

    // create a new floatmatrix, processed by iterating
    mapWith(other: FloatMatrix, callback: (self: number, other: number) => number): FloatMatrix {
        let result = this.clone();

        let width = Math.min(this.width, other.height);
        let height = Math.min(this.height, other.height);

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                result.set(i, j, callback(this.get(i, j), other.get(i, j)));
            }
        }

        return result;
    }

    toNative(): number[][] {
        let native: number[][] = [];
        for (var i = 0; i < this.height; i++) {
            native[i] = [];
            for (var j = 0; j < this.width; j++) {
                native[i][j] = this.get(i, j);
            }
        }
        return native;
    }

    // [CALCULATIONS]

    // generalized multiplication
    mul(b: FloatMatrix): FloatMatrix {
        
        let a = this;
        if (b.height !== a.width) {
            throw new Error(
                `Columns in A should be the same as the number of rows in B
                a.width ${a.width},
                b.height ${b.height}`,
            );
        }
        let size = a.width;
        var product = new FloatMatrix(b.width, a.height);

        for (var i = 0; i < product.height; i++) {
            for (var j = 0; j < product.width; j++) {
                let sum = 0;
                for (var k = 0; k < size; k++) {
                    sum += a.get(i, k) * b.get(k, j);
                }
                product.set(i, j, sum);
            }
        }

        return product;
    }

    tp() {
        let tp = FloatMatrix.zeros(this.height, this.width);
        for (let i = 0 ; i < this.height; i++) {
            for (let j = 0 ; j < this.width; j++) {
                tp.set(j, i, this.get(i, j));
            }
        }
        return tp;
    }

    inv() {
        return Stat.pinv(this);
    }

    inv2() {
        return Stat.pinv2(this);
    }
}

// stolen something from https://jamesmccaffrey.wordpress.com/2020/04/24/matrix-inverse-with-javascript/
// James D. McCaffrey

// function matInverse(m)
// {
//   // assumes determinant is not 0
//   // that is, the matrix does have an inverse
//   let n = m.length;
//   let result = matMake(n, n, 0.0); // make a copy
//   for (let i = 0; i less-than n; ++i) {
//     for (let j = 0; j less-than n; ++j) {
//       result[i][j] = m[i][j];
//     }
//   }

//   let lum = matMake(n, n, 0.0); // combined lower & upper
//   let perm = vecMake(n, 0.0);  // out parameter
//   matDecompose(m, lum, perm);  // ignore return

//   let b = vecMake(n, 0.0);
//   for (let i = 0; i less-than n; ++i) {
//     for (let j = 0; j less-than n; ++j) {
//       if (i == perm[j])
//         b[j] = 1.0;
//       else
//         b[j] = 0.0;
//     }

//     let x = reduce(lum, b); //
//     for (let j = 0; j less-than n; ++j)
//       result[j][i] = x[j];
//   }
//   return result;
// }

// function matDeterminant(m)
// {
//   let n = m.length;
//   let lum = matMake(n, n, 0.0);;
//   let perm = vecMake(n, 0.0);
//   let result = matDecompose(m, lum, perm);  // -1 or +1
//   for (let i = 0; i less-than n; ++i)
//     result *= lum[i][i];
//   return result;
// }

// function matDecompose(m, lum, perm)
// {
//   // Crout's LU decomposition for matrix determinant and inverse
//   // stores combined lower & upper in lum[][]
//   // stores row permuations into perm[]
//   // returns +1 or -1 according to even or odd perms
//   // lower gets dummy 1.0s on diagonal (0.0s above)
//   // upper gets lum values on diagonal (0.0s below)

//   let toggle = +1; // even (+1) or odd (-1) row permutatuions
//   let n = m.length;

//   // make a copy of m[][] into result lum[][]
//   //lum = matMake(n, n, 0.0);
//   for (let i = 0; i less-than n; ++i) {
//     for (let j = 0; j less-than n; ++j) {
//       lum[i][j] = m[i][j];
//     }
//   }

//   // make perm[]
//   //perm = vecMake(n, 0.0);
//   for (let i = 0; i less-than n; ++i)
//     perm[i] = i;

//   for (let j = 0; j less-than n - 1; ++j) {  // note n-1
//     let max = Math.abs(lum[j][j]);
//     let piv = j;

//     for (let i = j + 1; i less-than n; ++i) {  // pivot index
//       let xij = Math.abs(lum[i][j]);
//       if (xij greater-than max) {
//         max = xij;
//         piv = i;
//       }
//     } // i

//     if (piv != j) {
//       let tmp = lum[piv];  // swap rows j, piv
//       lum[piv] = lum[j];
//       lum[j] = tmp;

//       let t = perm[piv];  // swap perm elements
//       perm[piv] = perm[j];
//       perm[j] = t;

//       toggle = -toggle;
//     }

//     let xjj = lum[j][j];
//     if (xjj != 0.0) {  // TODO: fix bad compare here
//       for (let i = j + 1; i less-than n; ++i) {
//         let xij = lum[i][j] / xjj;
//         lum[i][j] = xij;
//         for (let k = j + 1; k less-than n; ++k) {
//           lum[i][k] -= xij * lum[j][k];
//         }
//       }
//     }

//   } // j

//   return toggle;  // for determinant
// } // matDecompose

// function reduce(lum, b) // helper
// {
//   let n = lum.length;
//   let x = vecMake(n, 0.0);
//   for (let i = 0; i less-than n; ++i) {
//     x[i] = b[i];
//   }

//   for (let i = 1; i less-than n; ++i) {
//     let sum = x[i];
//     for (let j = 0; j less-than i; ++j) {
//       sum -= lum[i][j] * x[j];
//     }
//     x[i] = sum;
//   }

//   x[n - 1] /= lum[n - 1][n - 1];
//   for (let i = n - 2; i greater-than-equal 0; --i) {
//     let sum = x[i];
//     for (let j = i + 1; j less-than n; ++j) {
//       sum -= lum[i][j] * x[j];
//     }
//     x[i] = sum / lum[i][i];
//   }

//   return x;
// } // reduce
