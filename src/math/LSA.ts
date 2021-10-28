import { Circle2, FloatMatrix, Matrix4, MultiVector2, MultiVector3, Stat } from "../lib";

/**
 * Use this namespace for fitting 
 */
export namespace LSA {


    /**
     * Find optimal `W` for `AW = b`. 
     */ 
    export function lsa(A: FloatMatrix, b: FloatMatrix) : FloatMatrix {


        let W = FloatMatrix.zeros(A.width);

        return W;
    }

    export function lsaCircle2(data: MultiVector2) : Circle2 {
        return Circle2.new();
    }

    
    /**
     *  solve x for Ax = b, where in this case, A = left, b = right.
     */ 
    export function lsaMatrix(left: MultiVector3, right: MultiVector3): Matrix4 {
        if (left.count != right.count) {
            throw "matrices need to be of equal width & height";
        }

        // construct linear system of equations
        let n = left.count;

        let left_width = 4;
        let right_width = 3;

        let height = right_width * n;
        let width = 16;
        let M = new FloatMatrix(width, height);

        // per row in floatmatrix
        for (let f = 0; f < n; f++) {
            let l_vec = [...left.slice().getRow(f), 1];
            let r_vec = [...right.slice().getRow(f), 1];

            // go over x', y', z', 1 on the right side
            for (let part = 0; part < right_width; part++) {
                //
                let i = f * right_width + part;
                let offset = left_width * part;

                // X  Y  Z  1  0  0  0  0 ...
                for (let j = 0; j < l_vec.length; j++) {
                    M.set(i, j + offset, l_vec[j]);
                }

                // ... -v*X  -v*Y  -v*Z   -v*1
                offset = width - left_width;
                for (let j = 0; j < l_vec.length; j++) {
                    let v = M.get(i, j + offset);
                    M.set(i, j + offset, v + -1 * r_vec[part] * l_vec[j]);
                }
            }
        }

        let [U, S, V] = Stat.svd(M);
        let col = V.getColumn(V.width - 1);
        let scaler = 1 / col[15];
        for (let i = 0; i < col.length; i++) {
            col[i] = Math.round(col[i] * scaler * 100000) / 100000;
        }

        // create the actual matrix
        let matrix = Matrix4.new([...col]);
        return matrix.transpose();
    }
}
