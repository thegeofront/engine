import { Circle2, FloatMatrix, Matrix4, MultiVector2, MultiVector3, Stat, Vector2 } from "../lib";

/**
 * Use this namespace for fitting 
 */
export namespace LSA {


    /**
     * Find optimal `W` for `AW = b(*error^2)`. 
     */ 
    export function lsa(A: FloatMatrix, b: FloatMatrix) : Float32Array {
        let mul = FloatMatrix.mulBtoA;
        let At = A.tp();
        let inv_ATA = mul(A, At).inv();
        let Atb = mul(b, At);
        let W = mul(Atb, inv_ATA);
        return W.getColumn(0);
    }

    // https://mec560sbu.github.io/2016/08/29/Least_SQ_Fitting/
    /**
     * returns center X, center Y, radius
     * @param points 
     * @returns 
     */
    export function circle2(points: MultiVector2) {

        // create and fill A & b
        let count = points.count;
        let A = FloatMatrix.zeros(3, count)
        let b = FloatMatrix.zeros(1, count)
        for (let i = 0 ; i < count; i++) {
            let [x,y] = points.matrix.getRow(i);
            
            A.setRow(i, [-2*x, -2*y, 1]);
            b.setRow(i, [-(x*x + y*y)]);
        }

        let w = lsa(A, b);
        // console.log(w);
        let xc = w[0];
        let yc = w[1]*-1; // note: WHY THE FUCK DO I NEED THIS -1???
        let r = Math.sqrt(xc * xc + yc * yc - w[2]);
        return [xc, yc, r];
    }

    /**
     * Progressive Least Squares Fitting of a circle. 
     * This method's result is comparable to normal Least Squares, but it can detect and remove outliers. 
     * This is at the cost of latency, since this will calculate an LSA circle every iterations
     * 
     * Returns a complete circle
     */
    export function circle2Progressive(included: MultiVector2, maxDeviation: number, maxIterations=1000) : {circle: Circle2, included: MultiVector2, excluded: MultiVector2} | undefined {
        
        let getIdWithLargestError = (circle: Circle2, points2d: MultiVector2) => {
            
            let highscore = 0;
            let highscoreId = -1;
            for (let i = 0 ; i < points2d.count; i++) {
                let p = points2d.get(i);
                let score = Math.abs(circle.distance(p));
                if (score > highscore) {
                    highscore = score;
                    highscoreId = i;
                }
            }
            return [highscore, highscoreId];
        }

        let excluded: Vector2[] = [];
        let points2d = included.clone();

        for (let i = 0; i < maxIterations; i++) {
            console.log(i);
            if (points2d.count < 2) {
                console.error("PROGRESSIVE-LSA FAILED DUE TO LESS THAN TWO POINTS (REMAIN WITHIN ERROR RANGE).");
                return undefined;
            }
        
            // get a circle using all `points`
            let circle = Circle2.fromLSA(points2d);

            // remove the point with an error larger than max-deviation
            let [largestError, largestID] = getIdWithLargestError(circle, points2d);
            console.log(largestError, circle.distance(points2d.get(largestID)), maxDeviation);
            if (largestError > maxDeviation) {
                
                // NOTE: SOMETHING'S STILL WRONG HERE...
                excluded.push(points2d.get(largestID));
                points2d = points2d.remove([largestID]);
                continue;
            }

            // if we arrive here, all errors are smaller than the max-deviation. We are done!
            return {
                circle, 
                included: points2d, 
                excluded: MultiVector2.fromList(excluded)
            };
        }
        console.error("PROGRESSIVE-LSA FAILED DUE TO TOO MANY ITERATIONS");
        return undefined;
    }

    
    /**
     *  solve x for Ax = b, where in this case, A = left, b = right.
     */ 
    export function matrix(left: MultiVector3, right: MultiVector3): Matrix4 {
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
