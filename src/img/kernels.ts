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

    static readonly Gauss5 = new Matrix(5,5, [
        2, 4, 5, 4, 2,
        4, 9,12, 9, 4,
        5,12,15,12, 5,
        4, 9,12, 9, 4,
        2, 4, 5, 4, 2,
    ]).scaleEntries(1/159);

    

    static readonly TestKernel = new Matrix(3,3, [
          1, 0,-1,
          0, 0, 0,
         -1, 0, 1,
    ]);

    static readonly SobelHor = new Matrix(3,3, [
         1, 2, 1,
         0, 0, 0,
         -1, -2, -1,
    ]);
    
    static readonly SobelVer = new Matrix(3,3, [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1,
    ]);
}

