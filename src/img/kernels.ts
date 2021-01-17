import { Matrix } from "../math/matrix"

// kernels
export class Kernels
{
    static readonly SmoothKernel = new Matrix(3,3, [
        1,1,1,
        1,1,1,
        1,1,1
    ]).scaleEntries(1/9);
     
    static readonly SmoothKernel5 = new Matrix(5,5, [
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1
    ]).scaleEntries(1/25);

    static readonly TestKernel = new Matrix(3,3, [
          1, 0,-1,
          0, 0, 0,
         -1, 0, 1,
    ]);

    static readonly HorEdgeKernel = new Matrix(3,3, [
        -1,-2,-1,
         0, 0, 0,
         1, 2, 1,
    ]);
    
    static readonly VerEdgeKernel = new Matrix(3,3, [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1,
    ]);
}

