import { GeneralMatrix } from "../math/Matrix"

// kernels
export class Kernels
{
    static readonly SmoothKernel = new GeneralMatrix(3,3, [
        1,1,1,
        1,1,1,
        1,1,1
    ]).scale(1/9);
     
    static readonly SmoothKernel5 = new GeneralMatrix(5,5, [
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1,
        1,1,1,1,1
    ]).scale(1/25);

    static readonly TestKernel = new GeneralMatrix(3,3, [
          1, 0,-1,
          0, 0, 0,
         -1, 0, 1,
    ]);

    static readonly HorEdgeKernel = new GeneralMatrix(3,3, [
        -1,-2,-1,
         0, 0, 0,
         1, 2, 1,
    ]);
    
    static readonly VerEdgeKernel = new GeneralMatrix(3,3, [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1,
    ]);
}

